const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

const connect = () => {
  try {
    mongoose.connect(MONGO_URL);
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { connect };
