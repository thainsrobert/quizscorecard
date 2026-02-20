const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let scores = {};
let rounds = 1;
let currentRound = 1;

io.on("connection", (socket) => {

    socket.emit("scoreUpdate", {
        scores,
        rounds,
        currentRound,
        lastUpdated: null
    });

    socket.on("updateScore", ({ team, points, round }) => {

        if (!scores[team]) scores[team] = {};
        if (!scores[team][round]) scores[team][round] = 0;

        scores[team][round] += points;

        io.emit("scoreUpdate", {
            scores,
            rounds,
            currentRound,
            lastUpdated: team
        });
    });

    socket.on("addTeam", (name) => {
        if (!scores[name]) scores[name] = {};
        io.emit("scoreUpdate", {
            scores,
            rounds,
            currentRound,
            lastUpdated: null
        });
    });

    socket.on("deleteTeam", (team) => {
        delete scores[team];
        io.emit("scoreUpdate", {
            scores,
            rounds,
            currentRound,
            lastUpdated: null
        });
    });

    socket.on("setRounds", (total) => {
        rounds = total;
        io.emit("scoreUpdate", {
            scores,
            rounds,
            currentRound,
            lastUpdated: null
        });
    });

    socket.on("changeRound", (round) => {
        currentRound = round;
        io.emit("scoreUpdate", {
            scores,
            rounds,
            currentRound,
            lastUpdated: null
        });
    });

    socket.on("resetScores", () => {
        scores = {};
        rounds = 1;
        currentRound = 1;

        io.emit("scoreUpdate", {
            scores,
            rounds,
            currentRound,
            lastUpdated: null
        });
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
