const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let scores = {
    "Team A": { 1: 0 },
    "Team B": { 1: 0 },
    "Team C": { 1: 0 }
};

// Helper function to ensure rounds exist
function ensureRound(team, round) {
    if (!scores[team]) return;
    if (!scores[team][round]) {
        scores[team][round] = 0;
    }
}

io.on('connection', (socket) => {

    console.log('User connected');

    // Send current scores on connection
    socket.emit('scoreUpdate', {
        scores: scores,
        lastUpdated: null
    });

    // Update score
    socket.on('updateScore', ({ team, points, round }) => {

        if (!scores[team]) return;

        ensureRound(team, round);

        scores[team][round] += points;

        io.emit('scoreUpdate', {
            scores: scores,
            lastUpdated: team
        });
    });

    // Add team
    socket.on('addTeam', (team) => {

        if (!team || scores[team]) return;

        scores[team] = { 1: 0 };

        io.emit('scoreUpdate', {
            scores: scores,
            lastUpdated: null
        });
    });

    // Delete team
    socket.on('deleteTeam', (team) => {

        if (!scores[team]) return;

        delete scores[team];

        io.emit('scoreUpdate', {
            scores: scores,
            lastUpdated: null
        });
    });

    // Reset all scores
    socket.on('resetScores', () => {

        for (let team in scores) {
            for (let round in scores[team]) {
                scores[team][round] = 0;
            }
        }

        io.emit('scoreUpdate', {
            scores: scores,
            lastUpdated: null
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});