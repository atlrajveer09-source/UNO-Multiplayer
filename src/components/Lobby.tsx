import React, { useState } from "react";

interface LobbyProps {
  onJoin: (roomId: string, username: string) => void;
}

export default function Lobby({ onJoin }: LobbyProps) {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId && username) {
      onJoin(roomId.toUpperCase(), username);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-950">
      <div className="bg-slate-900 p-12 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800 w-full max-w-sm">
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-uno-red via-uno-blue to-uno-green rounded-2xl flex items-center justify-center transform rotate-6 shadow-2xl mb-6 group hover:rotate-0 transition-all cursor-pointer">
             <span className="text-4xl font-black text-white italic tracking-tighter drop-shadow-lg">UNO</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Local Multiplayer</h1>
          <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-[0.3em]">Professional Edition</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">Your Identity</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:outline-none focus:border-uno-blue focus:ring-4 focus:ring-uno-blue/10 placeholder:text-slate-700 font-bold transition-all text-white"
              required
            />
          </div>

          <div className="space-y-3">
             <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">Room Frequency</label>
            <input
              type="text"
              placeholder="Ex: ALPHA"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 focus:outline-none focus:border-uno-blue focus:ring-4 focus:ring-uno-blue/10 placeholder:text-slate-700 font-black tracking-[0.2em] uppercase transition-all text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-uno-blue hover:bg-blue-400 text-white transition-all py-5 rounded-xl font-black text-lg shadow-xl shadow-uno-blue/30 active:scale-[0.98] active:translate-y-[2px]"
          >
            ESTABLISH LINK
          </button>
        </form>

        <div className="mt-10 text-center text-[10px] text-slate-600 uppercase font-bold tracking-widest leading-loose">
          Secure Peer-to-Peer<br />Local Domain Only
        </div>
      </div>
    </div>
  );
}
