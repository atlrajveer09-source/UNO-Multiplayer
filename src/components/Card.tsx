import { motion } from "motion/react";
import { Card as CardType, CardColor, CardType as CType } from "../types.ts";

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  isFaceDown?: boolean;
  className?: string;
  isPlayable?: boolean;
}

export default function Card({ card, onClick, disabled, isFaceDown, className, isPlayable }: CardProps) {
  const getBgColor = () => {
    switch (card.color) {
      case CardColor.RED: return "bg-uno-red";
      case CardColor.BLUE: return "bg-uno-blue";
      case CardColor.GREEN: return "bg-uno-green";
      case CardColor.YELLOW: return "bg-uno-yellow";
      case CardColor.WILD: return "bg-zinc-950";
      default: return "bg-slate-900";
    }
  };

  const getLabel = () => {
    switch (card.type) {
      case CType.NUMBER: return card.value?.toString();
      case CType.SKIP: return "Ø";
      case CType.REVERSE: return "⇄";
      case CType.DRAW_TWO: return "+2";
      case CType.WILD: return "W";
      case CType.WILD_DRAW_FOUR: return "+4";
      default: return "";
    }
  };

  if (isFaceDown) {
    return (
      <div className={`w-24 h-36 rounded-xl bg-slate-900 border-4 border-white flex items-center justify-center p-2 shadow-2xl ${className}`}>
        <div className="w-full h-full rounded-lg border-2 border-white/10 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
           <span className="text-2xl font-black text-white/20 italic tracking-tighter transform -rotate-12">UNO</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={isPlayable ? { scale: 1.05, translateY: -15, zIndex: 10 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`relative w-24 h-36 rounded-xl ${getBgColor()} border-[5px] border-white flex flex-col items-center justify-center p-1 shadow-[0_10px_20px_rgba(0,0,0,0.4)] cursor-pointer select-none transition-shadow ${isPlayable ? "ring-4 ring-white ring-offset-4 ring-offset-slate-950 scale-105" : ""} ${className}`}
    >
      {/* Corner Labels */}
      <div className="absolute top-1.5 left-2 text-xs font-black text-white">{getLabel()}</div>
      <div className="absolute bottom-1.5 right-2 text-xs font-black text-white rotate-180">{getLabel()}</div>

      {/* Center White Oval */}
      <div className="w-16 h-28 bg-white/20 rounded-[50%] flex items-center justify-center shadow-inner overflow-hidden transform -rotate-12">
        <span className="text-5xl font-black italic tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          {getLabel()}
        </span>
      </div>

      {/* Wild Background Pattern */}
      {card.color === CardColor.WILD && (
          <div className="absolute inset-0 opacity-100 pointer-events-none -z-10 rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                  <div className="bg-uno-red"></div>
                  <div className="bg-uno-blue"></div>
                  <div className="bg-uno-yellow"></div>
                  <div className="bg-uno-green"></div>
              </div>
          </div>
      )}
    </motion.div>
  );
}
