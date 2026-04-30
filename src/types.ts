/**
 * UNO Game Types
 */

export enum CardColor {
  RED = "red",
  BLUE = "blue",
  GREEN = "green",
  YELLOW = "yellow",
  WILD = "wild"
}

export enum CardType {
  NUMBER = "number",
  SKIP = "skip",
  REVERSE = "reverse",
  DRAW_TWO = "draw_two",
  WILD = "wild",
  WILD_DRAW_FOUR = "wild_draw_four"
}

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number; // 0-9 for NUMBER cards
}

export interface Player {
  id: string;
  name: string;
  hands: Card[];
  isHost: boolean;
}

export enum GameStatus {
  LOBBY = "lobby",
  PLAYING = "playing",
  FINISHED = "finished"
}

export interface GameState {
  players: Player[];
  status: GameStatus;
  currentTurn: number; // Index in players array
  direction: 1 | -1; // 1 for clockwise, -1 for counter-clockwise
  drawPile: Card[];
  discardPile: Card[];
  currentColor: CardColor; // Current color in play (relevant for wild cards)
  currentType: CardType; // Current type in play
  currentValue?: number; // Current value in play
  lastPlayedCard: Card | null;
  winner: string | null;
  logs: string[];
}
