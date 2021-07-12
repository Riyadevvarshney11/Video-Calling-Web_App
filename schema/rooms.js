const mongoose = require("mongoose");
//for storing meeting's information
const rooms = mongoose.Schema({
    roomId: {
        type: String,
        require: true,
    },
    userId: {
        type: String,
        require: true,
    },
    count: {
        type: Number,
        required: true,
    },
});

module.exports = new mongoose.model("rooms", rooms);