const express = require("express");
const router = express.Router();
const Token = require("../models/token");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const { genPassword } = require("../helper");
const { User } = require("../models/user");

router.post("/", async (request, response) => {
  const { email } = request.body;

  const userFromDB = await User.findOne({ email: email });
  if (!userFromDB) {
    response.status(401).send({ message: "No User with this Email" });
    return;
  } else {
    const secret = process.env.SECRET_KEY + userFromDB.password;
    const payload = {
      email: userFromDB.email,
      id: userFromDB._id,
    };

    const jwtToken = jwt.sign(payload, secret, { expiresIn: "15m" });

    let token = await new Token({
      userId: userFromDB._id,
      token: jwtToken,
    }).save();

    const message = `${process.env.BASE_URL}forgotPassword/resetpassword/${userFromDB._id}/${token.token}`;
    await sendEmail(email, "Verify Email", message);

    response.send({
      message: "An Email sent to your account please verify",
      token: jwtToken,
      id: userFromDB._id,
      success: true,
    });
  }
});

router.get("/resetpassword/:id/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send("Invalid link");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link");

    res.writeHead(301, { Location: "https://xenodochial-curie-f10544.netlify.app/#/resetpassword" });
    res.end();
  } catch (error) {
    res.status(400).send("An error occured");
  }
});

router.post("/resetpassword/:id/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send("user not in database");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    const secret = process.env.SECRET_KEY + user.password;
    const payload = jwt.verify(req.params.token, secret);

    if (payload) {
      let hashedPassword = await genPassword(req.body.password);

      await User.updateOne({ _id: user._id, password: hashedPassword });
      await Token.findByIdAndRemove(token._id);
      res.send({ success: true, message: "successfull" });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
