const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

const { User } = require("../models/user");

router.post("/", async (request, response) => {
  let success = false;
  const { email, password } = request.body;

  const userFromDB = await User.findOne({ email: email });
  if (!userFromDB) {
    success = false;
    response.status(401).send({ success, message: "Invalid credentials1" });
    return;
  }
  if (userFromDB.verified === false) {
    success = false;
    response.send({ success, message: "please verify your email" });
    return;
  }
  const storedPassword = userFromDB.password;

  const isPasswordMatch = await bcrypt.compare(password, storedPassword);

  if (isPasswordMatch) {
    const token = jwt.sign({ id: userFromDB._id }, process.env.SECRET_KEY);
    success = true;
    response.send({ success, message: "Successful login", token: token });
    // console.log(userFromDB);
  } else {
    success = false;
    response.status(401).send({ success, message: "Invalid credentials" });
  }
});

module.exports = router;
