const express = require("express");
const router = express.Router();

router.get("/privacy", (req, res) => {
  res.render("pages/privacy");
});

router.get("/terms", (req, res) => {
  res.render("pages/terms");
});

router.get("/contact", (req, res) => {
  res.render("pages/contact");
});

router.get("/socials", (req, res) => {
  res.render("pages/socials");
});

module.exports = router;
