const express = require("express");
const route = express.Router();
const { authorize } = require("../security_functions/authenFunc");
const room = require("../data_schema/rooms");
//Video Display
route.get("/:room", authorize, async (req, res) => {
  const roomData = await room.findOne({ roomId: req.params.room }).exec();
  res.render("room", {
    tabName: "Microsft Teams",
    count: roomData ? roomData.count : 0,
    layout: "layouts/videoLayout",
    roomId: req.params.room,
    screen: req.query.screen,
    user: req.user,
  });
});

module.exports = route;