const sendEmail = require("../utils/email");
const Token = require("../models/token");
const { User, validate } = require("../models/user");
const express = require("express");
const shortId = require("shortid");
const router = express.Router();
const { genPassword } = require("../helper");
router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    console.log(error);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).send({
        success: false,
        message: "User with given email already exist!",
      });

    let hashedPassword = await genPassword(req.body.password);

    user = await new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    }).save();

    let token = await new Token({
      userId: user._id,
      token: shortId.generate(),
    }).save();

    const message = `${process.env.BASE_URL}signup/verify/${user._id}/${token.token}`;
    await sendEmail(user.email, "Verify Email", message);

    res.send({
      success: true,
      message: "An Email sent to your account please verify",
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/verify/:id/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send("Invalid link");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link");

    await User.updateOne({ _id: user._id }, { $set: { verified: true } });
    await Token.findByIdAndRemove(token._id);

    res.send("email verified sucessfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
