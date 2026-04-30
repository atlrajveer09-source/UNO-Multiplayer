/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { GameStatus, GameState, Player } from "./types.ts";
import Lobby from "./components/Lobby.tsx";
import GameBoard from "./components/GameBoard.tsx";

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.LOBBY);
  const [roomId, setRoomId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on("room-update", ({ players, status }) => {
      setRoomPlayers(players);
      setGameStatus(status);
    });

    newSocket.on("game-state", (state: GameState) => {
      setGameState(state);
      setGameStatus(state.status);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (room: string, name: string) => {
    if (socket && room && name) {
      setRoomId(room);
      setUsername(name);
      socket.emit("join-room", { roomId: room, username: name });
      setJoined(true);
    }
  };

  const startGame = () => {
    if (socket && roomId) {
      socket.emit("start-game", roomId);
    }
  };

  const playCard = (cardId: string, chosenColor?: string) => {
    if (socket && roomId) {
      socket.emit("play-card", { roomId, cardId, chosenColor });
    }
  };

  const drawCard = () => {
    if (socket && roomId) {
      socket.emit("draw-card", roomId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-orange-500/30">
      {!joined ? (
        <Lobby onJoin={joinRoom} />
      ) : gameStatus === GameStatus.LOBBY ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md">
            <h1 className="text-4xl font-black mb-6 text-center text-orange-500 tracking-tighter">LOBBY</h1>
            <div className="mb-4 text-slate-400 text-center font-medium">Room: <span className="text-white">{roomId}</span></div>
            
            <div className="space-y-3 mb-8">
              <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold">Players ({roomPlayers.length})</h2>
              {roomPlayers.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                  <span className={p.id === socket?.id ? "text-orange-400 font-bold" : ""}>
                    {p.name} {p.id === socket?.id && "(You)"}
                  </span>
                  {p.isHost && <span className="text-[10px] bg-orange-500/20 text-orange-500 px-2 py-1 rounded-full font-bold">HOST</span>}
                </div>
              ))}
            </div>

            {roomPlayers.find(p => p.id === socket?.id)?.isHost ? (
              <button
                onClick={startGame}
                disabled={roomPlayers.length < 2}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/20"
              >
                START GAME
              </button>
            ) : (
              <div className="text-center text-slate-500 font-medium animate-pulse">Waiting for host to start...</div>
            )}
          </div>
        </div>
      ) : gameState ? (
        <GameBoard 
          gameState={gameState} 
          myId={socket?.id || ""} 
          onPlayCard={playCard} 
          onDrawCard={drawCard} 
        />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}
    </div>
  );
}

