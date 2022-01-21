require("dotenv").config();
const express = require("express");
const cors = require("cors");
const user = require("./routes/users");
const login = require("./routes/login");
const short = require("./routes/shorturl");
const forgot = require("./routes/forgotPassword");
var mongo = require("./connection");

const app = express();
app.use(cors());
mongo.connect();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello");
});
app.use("/signup", user);
app.use("/login", login);
app.use("/forgotPassword", forgot);
app.use("/short", short);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
