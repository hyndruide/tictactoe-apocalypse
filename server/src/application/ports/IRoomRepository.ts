import { Room } from '../../domain/entities/Room';

export interface IRoomRepository {
  save(room: Room): void;
  findByCode(code: string): Room | null;
  findByPlayerId(playerId: string): Room | null;
  delete(code: string): void;
}
