const express = require("express");
const router = express.Router();
const ShortUrl = require("../models/shortSchema");
const shortId = require("shortid");



router.get("/", async (req, res) => {
    const shortUrls = await ShortUrl.find();
    res.send(shortUrls);
  });

  router.post("/shortUrls", async (req, res) => {
    const code = shortId.generate();
    await ShortUrl.create({
      key: code,
      full: req.body.fullUrl,
      short: "https://forgot-password-by-vrushabh.herokuapp.com/short/" + code,
    });
  
    res.redirect("/");
  });

  router.get("/:shortUrl", async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ key: req.params.shortUrl });
    if (shortUrl == null) return res.sendStatus(404);
  
    shortUrl.clicks++;
    shortUrl.save();
  
    res.redirect(shortUrl.full);
  });

module.exports = router;
