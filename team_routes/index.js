const express = require("express");
const route = express.Router();
const { authorize } = require("../security_functions/authenFunc");

route.get("/", authorize, (req, res) => {
  res.render("index.ejs", { tabName: "Microsoft Teams", user: req.user });
});

module.exports = route;