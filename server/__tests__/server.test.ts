import { GameBoard } from '../src/domain/entities/GameBoard';
import { Player } from '../src/domain/entities/Player';
import { Room } from '../src/domain/entities/Room';
import { InMemoryRoomRepository } from '../src/infrastructure/repositories/InMemoryRoomRepository';
import { CreateRoomUseCase } from '../src/application/useCases/CreateRoomUseCase';
import { JoinRoomUseCase } from '../src/application/useCases/JoinRoomUseCase';
import { PlayMoveUseCase } from '../src/application/useCases/PlayMoveUseCase';
import { HandleDisconnectUseCase } from '../src/application/useCases/HandleDisconnectUseCase';
import { RestartGameUseCase } from '../src/application/useCases/RestartGameUseCase';

describe('Server Domain & Use Cases', () => {
  it('handles game board moves and detects victory', () => {
    const board = new GameBoard();
    expect(board.status.kind).toBe('PLAYING');

    // X: 0, O: 3, X: 1, O: 4, X: 2
    expect(board.applyMove(0, 'X')).toBe(true);
    expect(board.applyMove(3, 'O')).toBe(true);
    expect(board.applyMove(1, 'X')).toBe(true);
    expect(board.applyMove(4, 'O')).toBe(true);
    expect(board.applyMove(2, 'X')).toBe(true);

    expect(board.status).toEqual({ kind: 'WON', winner: 'X' });
  });

  it('orchestrates complete game flow through use cases', () => {
    const repo = new InMemoryRoomRepository();
    const emittedToSocket: Array<{ socketId: string; event: string; data: any }> = [];
    const emittedToRoom: Array<{ roomCode: string; event: string; data: any }> = [];

    const mockEventEmitter = {
      emitToSocket: (socketId: string, event: string, data: any) => {
        emittedToSocket.push({ socketId, event, data });
      },
      emitToRoom: (roomCode: string, event: string, data: any) => {
        emittedToRoom.push({ roomCode, event, data });
      },
      joinSocketToRoom: jest.fn(),
      leaveSocketFromRoom: jest.fn(),
    };

    const createRoom = new CreateRoomUseCase(repo, mockEventEmitter);
    const joinRoom = new JoinRoomUseCase(repo, mockEventEmitter);
    const playMove = new PlayMoveUseCase(repo, mockEventEmitter);
    const restartGame = new RestartGameUseCase(repo, mockEventEmitter);
    const disconnect = new HandleDisconnectUseCase(repo, mockEventEmitter);

    // 1. Host creates room
    const room = createRoom.execute('socket-host');
    expect(room.code).toBeTruthy();
    expect(emittedToSocket).toContainEqual(
      expect.objectContaining({ event: 'roomCreated' })
    );

    // 2. Guest joins room
    const joined = joinRoom.execute('socket-guest', room.code);
    expect(joined).toBe(true);
    expect(emittedToRoom).toContainEqual(
      expect.objectContaining({ event: 'gameStarted' })
    );

    // 3. Play moves
    const move1 = playMove.execute('socket-host', room.code, 0);
    expect(move1).toBe(true);

    const move2 = playMove.execute('socket-guest', room.code, 3);
    expect(move2).toBe(true);

    // 4. Replay
    const restarted = restartGame.execute('socket-host', room.code);
    expect(restarted).toBe(true);

    // 5. Disconnect
    disconnect.execute('socket-guest');
    expect(repo.findByCode(room.code)).toBeNull();
  });

  it('normalizes room codes flexibly and permits joining without V- prefix or with lowercase', () => {
    const repo = new InMemoryRoomRepository();
    const mockEventEmitter = {
      emitToSocket: jest.fn(),
      emitToRoom: jest.fn(),
      joinSocketToRoom: jest.fn(),
      leaveSocketFromRoom: jest.fn(),
    };

    const createRoom = new CreateRoomUseCase(repo, mockEventEmitter);
    const joinRoom = new JoinRoomUseCase(repo, mockEventEmitter);

    const room = createRoom.execute('host-1');
    const bareCode = room.code.replace('V-', ''); // e.g. "ABCD"

    // Join with bare code in lowercase
    const joinedBare = joinRoom.execute('guest-1', bareCode.toLowerCase());
    expect(joinedBare).toBe(true);
    expect(mockEventEmitter.joinSocketToRoom).toHaveBeenCalledWith('guest-1', room.code);
  });
});
