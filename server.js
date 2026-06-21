import http from "http";
import { WebSocketServer } from "ws";

const server = http.createServer();
const ws = new WebSocketServer({ server });

let rooms = {};
// rooms = {
//   "roomId": [
//     { ws, username, city, role }
//   ]
// }

// --------------------------------------------------
// BROADCAST
// --------------------------------------------------
function broadcast(room, data) {
    if (!rooms[room]) return;

    rooms[room].forEach(p => {
        if (p.ws.readyState === 1) {
            p.ws.send(JSON.stringify(data));
        }
    });
}

// --------------------------------------------------
// CONNECTION
// --------------------------------------------------
ws.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (msg) => {
        const data = JSON.parse(msg);

        // --------------------------------------------------
        // PLAYER JOIN
        // --------------------------------------------------
        if (data.type === "join") {
            const { room, username, city, role } = data;

            if (!rooms[room]) rooms[room] = [];

            rooms[room].push({ ws, username, city, role });
            ws.room = room;

            console.log(`Player joined room ${room}: ${username}`);

            // Oyuncu listesi gönder
            broadcast(room, {
                type: "players",
                players: rooms[room].map(p => ({
                    username: p.username,
                    city: p.city,
                    role: p.role
                }))
            });

            // --------------------------------------------------
            // ⭐ START MESAJI — Waiting sorununu çözen kısım
            // --------------------------------------------------
            if (rooms[room].length === 2) {
                const p1 = rooms[room][0];
                const p2 = rooms[room][1];

                broadcast(room, {
                    type: "start",
                    player1: p1.username,
                    player2: p2.username
                });

                console.log(`START gönderildi → ${room}: ${p1.username} vs ${p2.username}`);
            }
        }

        // --------------------------------------------------
        // CHAT MESSAGE
        // --------------------------------------------------
        if (data.type === "chat") {
            broadcast(ws.room, {
                type: "chat",
                username: data.username,
                message: data.message
            });
        }

        // --------------------------------------------------
        // MOVE MESSAGE
        // --------------------------------------------------
        if (data.type === "move") {
            broadcast(ws.room, data);
        }

        // --------------------------------------------------
        // DICE MESSAGE
        // --------------------------------------------------
        if (data.type === "dice") {
            broadcast(ws.room, data);
        }
    });

    // --------------------------------------------------
    // PLAYER DISCONNECT
    // --------------------------------------------------
    ws.on("close", () => {
        if (!ws.room || !rooms[ws.room]) return;

        rooms[ws.room] = rooms[ws.room].filter(p => p.ws !== ws);

        broadcast(ws.room, {
            type: "players",
            players: rooms[ws.room].map(p => ({
                username: p.username,
                city: p.city,
                role: p.role
            }))
        });

        console.log("Client disconnected");
    });
});

// --------------------------------------------------
// SERVER LISTEN
// --------------------------------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("WebSocket server running on port " + PORT);
});
