import { GameBoard } from './GameBoard';
import { Player } from './Player';

export class Room {
  public readonly gameBoard: GameBoard = new GameBoard();
  public host: Player;
  public guest: Player | null = null;

  constructor(
    public readonly code: string,
    hostPlayer: Player
  ) {
    this.host = hostPlayer;
  }

  isFull(): boolean {
    return this.guest !== null;
  }

  hasPlayer(socketId: string): boolean {
    return this.host.id === socketId || this.guest?.id === socketId;
  }

  getPlayer(socketId: string): Player | null {
    if (this.host.id === socketId) {
      return this.host;
    }
    if (this.guest?.id === socketId) {
      return this.guest;
    }
    return null;
  }

  join(guestPlayer: Player): boolean {
    if (this.isFull()) {
      return false;
    }
    this.guest = guestPlayer;
    return true;
  }

  removePlayer(socketId: string): void {
    if (this.host.id === socketId) {
      // Host left
    } else if (this.guest?.id === socketId) {
      this.guest = null;
    }
  }
}
