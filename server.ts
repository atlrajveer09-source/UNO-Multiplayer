import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GameEngine } from "./src/engine/GameEngine.ts";
import { GameStatus, Player } from "./src/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Game state management
  const rooms = new Map<string, {
    engine: GameEngine | null;
    players: Player[];
    hostId: string;
  }>();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", ({ roomId, username }: { roomId: string; username: string }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          engine: null,
          players: [],
          hostId: socket.id
        });
      }

      const room = rooms.get(roomId)!;
      const newPlayer: Player = {
        id: socket.id,
        name: username,
        hands: [],
        isHost: room.hostId === socket.id
      };

      room.players.push(newPlayer);
      
      io.to(roomId).emit("room-update", {
        players: room.players,
        status: room.engine ? GameStatus.PLAYING : GameStatus.LOBBY
      });
      
      console.log(`User ${username} joined room ${roomId}`);
    });

    socket.on("start-game", (roomId: string) => {
      const room = rooms.get(roomId);
      if (room && room.hostId === socket.id) {
        room.engine = new GameEngine(room.players);
        io.to(roomId).emit("game-state", room.engine.getState());
        console.log(`Game started in room ${roomId}`);
      }
    });

    socket.on("play-card", ({ roomId, cardId, chosenColor }: { roomId: string; cardId: string; chosenColor?: any }) => {
      const room = rooms.get(roomId);
      if (room && room.engine) {
        const success = room.engine.playCard(socket.id, cardId, chosenColor);
        if (success) {
          io.to(roomId).emit("game-state", room.engine.getState());
        }
      }
    });

    socket.on("draw-card", (roomId: string) => {
      const room = rooms.get(roomId);
      if (room && room.engine) {
        const engineState = room.engine.getState();
        // Check if it's the player's turn
        if (engineState.players[engineState.currentTurn].id === socket.id) {
          room.engine.drawCard(socket.id);
          // Auto-skip or let player play? Usually UNO lets you play if it matches, 
          // but for simplicity we'll just draw and stay on turn (or skip if requested)
          // Simplified: Draw and broadcast
          io.to(roomId).emit("game-state", room.engine.getState());
        }
      }
    });

    socket.on("skip-turn", (roomId: string) => {
        // Option to skip after drawing
        const room = rooms.get(roomId);
        if(room && room.engine) {
             const engineState = room.engine.getState();
             if (engineState.players[engineState.currentTurn].id === socket.id) {
                // We need a force skip method in engine if we want this
                // For now, playing logic handles turns.
             }
        }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Clean up rooms
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            rooms.delete(roomId);
          } else {
            if (room.hostId === socket.id) {
              room.hostId = room.players[0].id;
              room.players[0].isHost = true;
            }
            io.to(roomId).emit("room-update", {
              players: room.players,
              status: room.engine ? GameStatus.PLAYING : GameStatus.LOBBY
            });
          }
        }
      });
    });
  });

  // Serve static files
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
