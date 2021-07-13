const mongoose = require("mongoose");
//peerUser information
const peerUser = mongoose.Schema({
  peerId: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  //audio
  audio: {
    type: Boolean,
    required: true,
  },
  //video 
  video: {
    type: Boolean,
    required: true,
  },
});

module.exports = new mongoose.model("peerUser", peerUser);