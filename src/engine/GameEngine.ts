import { Card, CardColor, CardType, GameState, GameStatus, Player } from "../types.ts";

export class GameEngine {
  private state: GameState;

  constructor(players: Player[]) {
    this.state = this.createInitialState(players);
  }

  private createInitialState(players: Player[]): GameState {
    const deck = this.generateDeck();
    const shuffledDeck = this.shuffle(deck);
    
    // Distribute cards
    const updatedPlayers = players.map(player => ({
      ...player,
      hands: shuffledDeck.splice(0, 7)
    }));

    const firstCard = shuffledDeck.pop()!;
    
    return {
      players: updatedPlayers,
      status: GameStatus.PLAYING,
      currentTurn: 0,
      direction: 1,
      drawPile: shuffledDeck,
      discardPile: [firstCard],
      currentColor: firstCard.color === CardColor.WILD ? CardColor.RED : firstCard.color,
      currentType: firstCard.type,
      currentValue: firstCard.value,
      lastPlayedCard: firstCard,
      winner: null,
      logs: ["Game started!"]
    };
  }

  private generateDeck(): Card[] {
    const deck: Card[] = [];
    const colors = [CardColor.RED, CardColor.BLUE, CardColor.GREEN, CardColor.YELLOW];

    colors.forEach(color => {
      // 0 card
      deck.push({ id: `number-${color}-0`, color, type: CardType.NUMBER, value: 0 });
      
      // 1-9 cards (two of each)
      for (let i = 1; i <= 9; i++) {
        deck.push({ id: `number-${color}-${i}-a`, color, type: CardType.NUMBER, value: i });
        deck.push({ id: `number-${color}-${i}-b`, color, type: CardType.NUMBER, value: i });
      }

      // Actions (two of each)
      [CardType.SKIP, CardType.REVERSE, CardType.DRAW_TWO].forEach(type => {
        deck.push({ id: `${type}-${color}-a`, color, type });
        deck.push({ id: `${type}-${color}-b`, color, type });
      });
    });

    // Wild cards (4 of each)
    for (let i = 0; i < 4; i++) {
      deck.push({ id: `wild-${i}`, color: CardColor.WILD, type: CardType.WILD });
      deck.push({ id: `wild_draw_four-${i}`, color: CardColor.WILD, type: CardType.WILD_DRAW_FOUR });
    }

    return deck;
  }

  private shuffle(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public getState(): GameState {
    return this.state;
  }

  public playCard(playerId: string, cardId: string, chosenColor?: CardColor): boolean {
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex !== this.state.currentTurn) return false;

    const player = this.state.players[playerIndex];
    const cardIndex = player.hands.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return false;

    const card = player.hands[cardIndex];

    // Validation
    if (!this.isValidMove(card)) return false;

    // Apply card effect
    player.hands.splice(cardIndex, 1);
    this.state.discardPile.push(card);
    this.state.lastPlayedCard = card;
    this.state.currentType = card.type;
    this.state.currentValue = card.value;
    
    if (card.color === CardColor.WILD) {
      this.state.currentColor = chosenColor || CardColor.RED;
    } else {
      this.state.currentColor = card.color;
    }

    this.state.logs.push(`${player.name} played ${card.type} ${card.value ?? ""}`);

    // Check win condition
    if (player.hands.length === 0) {
      this.state.status = GameStatus.FINISHED;
      this.state.winner = player.id;
      this.state.logs.push(`${player.name} WON THE GAME!`);
      return true;
    }

    // Special card effects and next turn
    this.handleCardEffect(card);
    this.nextTurn();

    return true;
  }

  private isValidMove(card: Card): boolean {
    if (card.type === CardType.WILD || card.type === CardType.WILD_DRAW_FOUR) return true;
    
    if (card.color === this.state.currentColor) return true;
    
    if (card.type === CardType.NUMBER && card.value === this.state.currentValue) return true;
    
    if (card.type !== CardType.NUMBER && card.type === this.state.currentType) return true;

    return false;
  }

  private handleCardEffect(card: Card) {
    const nextPlayerIndex = this.getNextPlayerIndex();
    const nextPlayer = this.state.players[nextPlayerIndex];

    switch (card.type) {
      case CardType.SKIP:
        this.nextTurn(); // Skip one person
        break;
      case CardType.REVERSE:
        if (this.state.players.length === 2) {
          this.nextTurn(); // Works like skip in 2 players
        } else {
          this.state.direction *= -1;
        }
        break;
      case CardType.DRAW_TWO:
        for (let i = 0; i < 2; i++) this.drawCard(nextPlayer.id);
        this.nextTurn(); // Skip their turn
        break;
      case CardType.WILD_DRAW_FOUR:
        for (let i = 0; i < 4; i++) this.drawCard(nextPlayer.id);
        this.nextTurn(); // Skip their turn
        break;
    }
  }

  public drawCard(playerId: string): Card | null {
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return null;

    if (this.state.drawPile.length === 0) {
      this.reshuffleDiscardPile();
    }

    const card = this.state.drawPile.pop();
    if (card) {
      this.state.players[playerIndex].hands.push(card);
      return card;
    }
    return null;
  }

  private reshuffleDiscardPile() {
    const topCard = this.state.discardPile.pop()!;
    this.state.drawPile = this.shuffle(this.state.discardPile);
    this.state.discardPile = [topCard];
  }

  private getNextPlayerIndex(): number {
    let nextIndex = this.state.currentTurn + this.state.direction;
    if (nextIndex >= this.state.players.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = this.state.players.length - 1;
    return nextIndex;
  }

  private nextTurn() {
    this.state.currentTurn = this.getNextPlayerIndex();
  }
}
