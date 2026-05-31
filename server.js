import http from "http";
import { WebSocketServer } from "ws";
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Server is running");
});

const server = http.createServer();
const wss = new WebSocketServer({ server });

let rooms = {}; 
// rooms = {
//   "room1": [
//      { ws, username, city, role }
//   ]
// }

function broadcast(room, data) {
  if (!rooms[room]) return;
  rooms[room].forEach(client => {
    if (client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    // -------------------------
    // PLAYER JOIN
    // -------------------------
    if (data.type === "join") {
      const { room, username, city, role } = data;

      if (!rooms[room]) rooms[room] = [];

      rooms[room].push({ ws, username, city, role });
      ws.room = room;

      console.log(`Player joined room ${room}: ${username}`);

      // Send updated player list
      broadcast(room, {
        type: "players",
        players: rooms[room].map(p => ({
          username: p.username,
          city: p.city,
          role: p.role
        }))
      });
    }

    // -------------------------
    // CHAT MESSAGE
    // -------------------------
    if (data.type === "chat") {
      broadcast(ws.room, {
        type: "chat",
        username: data.username,
        message: data.message
      });
    }

    // -------------------------
    // MOVE MESSAGE
    // -------------------------
    if (data.type === "move") {
      broadcast(ws.room, data);
    }

    // -------------------------
    // DICE MESSAGE
    // -------------------------
    if (data.type === "dice") {
      broadcast(ws.room, data);
    }
  });

  // -------------------------
  // PLAYER DISCONNECT
  // -------------------------
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("WebSocket server running on port " + PORT);
});


