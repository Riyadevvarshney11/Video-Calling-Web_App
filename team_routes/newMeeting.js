//new meeting js file
const express = require("express");
const route = express.Router();
const { authorize } = require("../security_functions/authenFunc");
const { v4: uuidV4 } = require("uuid");
route.get("/", authorize, (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

module.exports = route;