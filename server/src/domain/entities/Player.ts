import { PlayerSymbol } from '../types';

export class Player {
  constructor(
    public readonly id: string,
    public readonly symbol: PlayerSymbol
  ) {}
}
