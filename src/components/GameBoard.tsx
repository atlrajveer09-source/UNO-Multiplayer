import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameState, CardColor, CardType as CType } from "../types.ts";
import Card from "./Card.tsx";
import { User, LogIn, ChevronRight, RotateCw, SkipForward } from "lucide-react";

interface GameBoardProps {
  gameState: GameState;
  myId: string;
  onPlayCard: (cardId: string, chosenColor?: string) => void;
  onDrawCard: () => void;
}

export default function GameBoard({ gameState, myId, onPlayCard, onDrawCard }: GameBoardProps) {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const me = gameState.players.find((p) => p.id === myId);
  const others = gameState.players.filter((p) => p.id !== myId);
  const isMyTurn = gameState.players[gameState.currentTurn].id === myId;

  const handleCardClick = (cardId: string) => {
    if (!isMyTurn) return;

    const card = me?.hands.find((c) => c.id === cardId);
    if (card?.color === CardColor.WILD) {
      setShowColorPicker(cardId);
    } else {
      onPlayCard(cardId);
    }
  };

  const selectColor = (color: CardColor) => {
    if (showColorPicker) {
      onPlayCard(showColorPicker, color);
      setShowColorPicker(null);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col bg-slate-950 select-none">
      {/* Header Bar */}
      <div className="h-[60px] bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-uno-blue px-3 py-1 rounded font-bold text-[10px] tracking-widest uppercase">HOST</div>
          <div className="font-bold text-sm tracking-tight">ROOM: {window.location.hash.slice(1) || "LOBBY"}</div>
        </div>
        <div className="flex gap-6 text-xs text-slate-400 font-medium">
          <div>Network: <span className="text-uno-green font-bold">Local WiFi (Stable)</span></div>
          <div>Latency: <span className="text-uno-green font-bold">14ms</span></div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-6 bg-slate-950">
        {/* Table Background */}
        <div className="absolute w-[80%] h-[50%] bg-radial from-emerald-800 to-emerald-950 border-[8px] border-emerald-950 rounded-[200px] shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]" />

        {/* Players Top Section */}
        <div className="relative z-10 flex gap-12 mb-20">
          {others.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-2">
              <div className="relative">
                {gameState.currentTurn === gameState.players.indexOf(p) && (
                  <motion.div 
                    layoutId="turn-indicator"
                    className="absolute -inset-1 border-2 border-uno-yellow rounded-full animate-pulse z-0"
                  />
                )}
                <div className={`w-16 h-16 rounded-full bg-slate-800 border-[3px] flex items-center justify-center font-bold z-10 relative ${
                  gameState.currentTurn === gameState.players.indexOf(p) ? "border-uno-yellow text-uno-yellow" : "border-slate-700"
                }`}>
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="text-xs font-bold text-center">{p.name}</div>
              <div className="bg-slate-900 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 border border-slate-800">
                {p.hands.length} Cards
              </div>
            </div>
          ))}
        </div>

        {/* Board Center */}
        <div className="relative z-10 flex gap-16 items-center translate-y-[-20px]">
          {/* Draw Pile */}
          <div 
            className="cursor-pointer group relative transition-transform hover:scale-105 active:scale-95" 
            onClick={isMyTurn ? onDrawCard : undefined}
          >
             <Card card={{ id: "back", color: CardColor.WILD, type: CType.DRAW_TWO }} isFaceDown />
             <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800 text-[8px] font-black tracking-widest text-white whitespace-nowrap">DRAW CARD</span>
             </div>
          </div>

          {/* Discard Pile */}
          <div className="relative w-24 h-36">
             <AnimatePresence mode="popLayout">
                <motion.div
                  key={gameState.lastPlayedCard?.id}
                  initial={{ scale: 0, rotate: -45, opacity: 0, x: -100 }}
                  animate={{ scale: 1, rotate: Math.random() * 10 - 5, opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="absolute inset-0"
                >
                  {gameState.lastPlayedCard && <Card card={gameState.lastPlayedCard} />}
                </motion.div>
             </AnimatePresence>
          </div>
        </div>

        {/* History Panel */}
        <div className="absolute right-8 top-8 w-56 bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-md z-20">
          <div className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-[0.1em]">Game History</div>
          <div className="space-y-3">
            {gameState.logs.slice(-4).map((log, i) => (
              <div 
                key={i} 
                className={`text-xs ${i === gameState.logs.slice(-4).length -1 ? "text-white font-semibold" : "text-slate-500"}`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Hand Section */}
      <div className="relative z-30 flex flex-col items-center gap-6 pb-10">
        <div className="flex justify-center px-10 h-40">
          <div className="flex -space-x-12 hover:space-x-4 transition-all duration-300 px-10 pt-4">
            {me?.hands.map((card, index) => (
              <Card 
                key={card.id} 
                card={card} 
                onClick={() => handleCardClick(card.id)}
                isPlayable={isMyTurn && (
                  card.type === CType.WILD || 
                  card.type === CType.WILD_DRAW_FOUR ||
                  card.color === gameState.currentColor ||
                  (card.type === CType.NUMBER && card.value === gameState.currentValue) ||
                  (card.type !== CType.NUMBER && card.type === gameState.currentType)
                )}
                className={`transform transition-transform ${!isMyTurn ? "opacity-60 scale-90" : "hover:translate-y-[-20px]"}`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-4">
           {isMyTurn && (
             <motion.button 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-gradient-to-b from-uno-yellow to-amber-600 text-white px-10 py-3 rounded-full font-black text-lg shadow-[0_4px_0_#92400e] hover:brightness-110 active:translate-y-[2px] active:shadow-none transition-all"
             >
                UNO!
             </motion.button>
           )}
           <button 
             onClick={onDrawCard}
             disabled={!isMyTurn}
             className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-full font-bold text-base disabled:opacity-50 transition-colors"
           >
              Draw Card
           </button>
        </div>
      </div>

      {/* Win Modal Overlay */}
      <AnimatePresence>
        {gameState.status === "finished" && (
            <motion.div 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-[100] flex items-center justify-center bg-orange-500 text-white"
            >
                <div className="text-center p-12">
                    <h1 className="text-8xl font-black italic tracking-tighter mb-4">GAME OVER</h1>
                    <p className="text-2xl font-bold uppercase tracking-widest">{gameState.players.find(p => p.id === gameState.winner)?.name} WINS!</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-12 bg-white text-orange-600 px-10 py-5 rounded-2xl font-black text-xl hover:bg-orange-100 transition-colors shadow-2xl"
                    >
                        PLAY AGAIN
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
