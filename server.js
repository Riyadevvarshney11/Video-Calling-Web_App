if (process.env.NODE_ENV !== "production") require("dotenv").config();
const express = require("express");
const app = express();
const path =require('path');
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const cookie = require("cookie-session");
const passport = require("passport");
const flash = require("express-flash");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const passportAuthenticator = require("./security_functions/passportStrategy");
const user = require("./data_schema/user");
const peerServer = ExpressPeerServer(server, {
    debug: true,
    allow_discovery: true
});
const peerUser = require("./data_schema/peerUser");
const room = require("./data_schema/rooms");

const videoRoom = require("./team_routes/video");
const signup = require("./team_routes/authenticate/signup");
const login = require("./team_routes/authenticate/login");
const logout = require("./team_routes/authenticate/logout");
const index = require("./team_routes/index");
const newMeeting = require("./team_routes/newMeeting");
const db = process.env.MONGO_URI;


/*const connectDB = async () => {
    try {
        await
        mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log("MongooseDB Connected ....");
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
}
module.exports = connectDB;*/

/*module.exports = async () => {
    await mongoose.connect('mongodb+srv://riya:riya@videochat.ye8co.mongodb.net/myFirstDatabase?retryWrites=true&w=majority&ssl=true', {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
        .then(x => {
            console.log( "Connected");
        })
        .catch(err => {
            console.error('Error connecting to mongo', err);
        });
    return mongoose;
};*/
mongoose.connect('mongodb+srv://riya:riya@videochat.ye8co.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => {
        console.log("database connected");
    })
    .catch((error) => {
        console.log("mongo error",error);
    }); 


passportAuthenticator(passport, user);
app.use(express.json());
app.use("/peerjs", peerServer);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(cookie({ maxAge: 30 * 24 * 60 * 60 * 1000, keys: ["soumenkhara"] }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
app.use(flash());
app.use(require("express-ejs-layouts"));
app.set("layout", "layouts/layout");

app.post("/join-room", (req, res) => {
    res.redirect(`/${req.body.room_id}`);
});

// index route
app.use("/", index);

// user id get
app.get("/user", async (req, res) => {
    res.json({
        user: await peerUser.findOne({ peerId: req.query.peer }).exec(),
    });
});
// new meeting
app.use("/new-meeting", newMeeting);

// login
app.use("/login", login);

// signup
app.use("/signup", signup);

// logout
app.use("/logout", logout);

// video room
app.use("/", videoRoom);

io.on("connection", (socket) => {
    socket.on(
        "join-room",
        async (roomId, peerId, userId, name, audio, video) => {
            // add peer details
            await peerUser({
                peerId: peerId,
                name: name,
                audio: audio,
                video: video,
            }).save();
            // add room details
            var roomData = await room.findOne({ roomId: roomId }).exec();
            if (roomData == null) {
                await room({
                    roomId: roomId,
                    userId: userId,
                    count: 1,
                }).save();
                roomData = { count: 0 };
            } else if (roomData.userId == userId) {
                await room.updateOne(
                    { roomId: roomId },
                    { count: roomData.count + 1 }
                );
            }
            socket.join(roomId);
            socket
                .to(roomId)
                .emit(
                    "user-connected",
                    peerId,
                    name,
                    audio,
                    video,
                    roomData.count + 1
                );
            socket.on("audio-toggle", async (type) => {
                await peerUser.updateOne({ peerId: peerId }, { audio: type });
                socket
                    .to(roomId)
                    .emit("user-audio-toggle", peerId, type);
            });
            socket.on("video-toggle", async (type) => {
                await peerUser.updateOne({ peerId: peerId }, { video: type });
                socket
                    .to(roomId)
                    .emit("user-video-toggle", peerId, type);
            });
            // chat
            socket.on("client-send", (data) => {
                socket.to(roomId).emit("client-podcast", data, name);
            });
            socket.on("disconnect", async () => {
                roomData = await room.findOne({ roomId: roomId }).exec();
                await room.updateOne(
                    { roomId: roomId },
                    { count: roomData.count - 1 }
                );
                // remove peer details
                await peerUser.deleteOne({ peerId: peerId });
                socket
                    .to(roomId)
                    .emit(
                        "user-disconnected",
                        peerId,
                        roomData.count - 1
                    );
            });
        });           
});
const PORT = process.env.PORT || 5000 ;
server.listen(PORT,()=>{
    console.log(`server started ${PORT}`)
})
