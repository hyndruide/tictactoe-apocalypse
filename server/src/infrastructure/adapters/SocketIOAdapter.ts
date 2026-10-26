import { Server as SocketIOServer, Socket } from 'socket.io';
import { CreateRoomUseCase } from '../../application/useCases/CreateRoomUseCase';
import { JoinRoomUseCase } from '../../application/useCases/JoinRoomUseCase';
import { PlayMoveUseCase } from '../../application/useCases/PlayMoveUseCase';
import { HandleDisconnectUseCase } from '../../application/useCases/HandleDisconnectUseCase';
import { RestartGameUseCase } from '../../application/useCases/RestartGameUseCase';

export class SocketIOAdapter {
  constructor(
    private readonly io: SocketIOServer,
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly joinRoomUseCase: JoinRoomUseCase,
    private readonly playMoveUseCase: PlayMoveUseCase,
    private readonly handleDisconnectUseCase: HandleDisconnectUseCase,
    private readonly restartGameUseCase: RestartGameUseCase
  ) {}

  registerHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('createRoom', () => {
        this.createRoomUseCase.execute(socket.id);
      });

      socket.on('joinRoom', (payload: { roomCode: string }) => {
        if (!payload || !payload.roomCode) {
          socket.emit('error', { message: 'Code de partie requis.' });
          return;
        }
        this.joinRoomUseCase.execute(socket.id, payload.roomCode);
      });

      socket.on('playMove', (payload: { roomCode: string; cellIndex: any }) => {
        if (!payload || !payload.roomCode || payload.cellIndex === undefined) {
          return;
        }
        this.playMoveUseCase.execute(socket.id, payload.roomCode, payload.cellIndex);
      });

      socket.on('replay', (payload: { roomCode: string }) => {
        if (!payload || !payload.roomCode) {
          return;
        }
        this.restartGameUseCase.execute(socket.id, payload.roomCode);
      });

      socket.on('leaveRoom', () => {
        this.handleDisconnectUseCase.execute(socket.id);
      });

      socket.on('disconnect', () => {
        this.handleDisconnectUseCase.execute(socket.id);
      });
    });
  }
}
