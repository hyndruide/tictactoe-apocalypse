import { Server as SocketIOServer, Socket } from 'socket.io';
import { CreateRoomUseCase } from '../../application/useCases/CreateRoomUseCase';
import { JoinRoomUseCase } from '../../application/useCases/JoinRoomUseCase';
import { PlayMoveUseCase } from '../../application/useCases/PlayMoveUseCase';
import { HandleDisconnectUseCase } from '../../application/useCases/HandleDisconnectUseCase';
import { RestartGameUseCase } from '../../application/useCases/RestartGameUseCase';
import { IRoomRepository } from '../../application/ports/IRoomRepository';
import { IEventEmitter } from '../../application/ports/IEventEmitter';
import { normalizeRoomCode } from '../../domain/normalizeRoomCode';
import { Player } from '../../domain/entities/Player';

export class SocketIOAdapter {
  // Associe l'adresse IP de l'hôte au code de sa salle en attente
  private pendingHostRooms: Map<string, string> = new Map();

  constructor(
    private readonly io: SocketIOServer,
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly joinRoomUseCase: JoinRoomUseCase,
    private readonly playMoveUseCase: PlayMoveUseCase,
    private readonly handleDisconnectUseCase: HandleDisconnectUseCase,
    private readonly restartGameUseCase: RestartGameUseCase,
    private readonly roomRepository?: IRoomRepository,
    private readonly eventEmitter?: IEventEmitter
  ) {}

  private getClientIp(socket: Socket): string {
    const forwarded = socket.handshake.headers['x-forwarded-for'];
    if (forwarded) {
      const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      return first.trim();
    }
    return socket.handshake.address;
  }

  registerHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      const clientIp = this.getClientIp(socket);
      console.log(`[SOCKET CONNECT] id=${socket.id} ip=${clientIp}`);

      // Reconnexion automatique pour l'hôte s'il revient après mise en veille mobile
      const pendingCode = this.pendingHostRooms.get(clientIp);
      if (pendingCode && this.roomRepository && this.eventEmitter) {
        const room = this.roomRepository.findByCode(pendingCode);
        if (room) {
          const isHostConnected = this.io.sockets.sockets.has(room.host.id);
          if (!isHostConnected) {
            console.log(
              `[AUTO-RECONNECT HOST] Re-attaching socket=${socket.id} (ip=${clientIp}) as Host X for room=${room.code}`
            );
            room.host = new Player(socket.id, 'X');
            this.roomRepository.save(room);
            socket.join(room.code);
            this.eventEmitter.joinSocketToRoom(socket.id, room.code);

            // Si un invité a rejoint pendant que l'hôte était en arrière-plan, démarrer immédiatement le jeu
            if (room.isFull()) {
              const currentTurn =
                room.gameBoard.status.kind === 'PLAYING'
                  ? room.gameBoard.status.currentPlayer
                  : 'X';
              console.log(
                `[AUTO-RECONNECT] Room is already full, sending gameStarted to Host ${socket.id}`
              );
              socket.emit('gameStarted', {
                roomCode: room.code,
                player: 'X',
                board: room.gameBoard.board,
                currentTurn,
              });
            }
          }
        } else {
          this.pendingHostRooms.delete(clientIp);
        }
      }

      socket.on('createRoom', () => {
        console.log(`[EVENT: createRoom] from=${socket.id} ip=${clientIp}`);
        const room = this.createRoomUseCase.execute(socket.id, clientIp);
        this.pendingHostRooms.set(clientIp, room.code);
      });

      socket.on('joinRoom', (payload: { roomCode: string }) => {
        console.log(`[EVENT: joinRoom] from=${socket.id} ip=${clientIp} payload=${JSON.stringify(payload)}`);
        if (!payload || !payload.roomCode) {
          socket.emit('error', { message: 'Code de partie requis.' });
          return;
        }

        // Si l'invité se connecte, s'assurer qu'il n'est pas marqué comme hôte en attente
        if (this.pendingHostRooms.get(clientIp) === payload.roomCode) {
          // Même IP (même réseau local)
        }

        this.joinRoomUseCase.execute(socket.id, payload.roomCode, clientIp);
      });

      socket.on('reconnectRoom', (payload: { roomCode: string; player: 'X' | 'O' }) => {
        console.log(`[EVENT: reconnectRoom] from=${socket.id} payload=${JSON.stringify(payload)}`);
        if (!payload || !payload.roomCode || !this.roomRepository || !this.eventEmitter) {
          return;
        }

        const canonical = normalizeRoomCode(payload.roomCode);
        const room =
          this.roomRepository.findByCode(canonical) ||
          this.roomRepository.findByCode(payload.roomCode.trim().toUpperCase());

        if (!room) {
          console.warn(`[RECONNECT FAILED] room not found: ${payload.roomCode}`);
          return;
        }

        // Réassigner le socket ID au rôle correspondant
        if (payload.player === 'X') {
          room.host = new Player(socket.id, 'X');
          this.pendingHostRooms.set(clientIp, room.code);
        } else if (payload.player === 'O') {
          room.guest = new Player(socket.id, 'O');
        }
        this.roomRepository.save(room);
        this.eventEmitter.joinSocketToRoom(socket.id, room.code);

        const currentTurn =
          room.gameBoard.status.kind === 'PLAYING'
            ? room.gameBoard.status.currentPlayer
            : 'X';

        console.log(
          `[RECONNECT SUCCESS] socket=${socket.id} reattached to room=${room.code} as player=${payload.player}`
        );

        if (room.isFull()) {
          socket.emit('gameStarted', {
            roomCode: room.code,
            player: payload.player,
            board: room.gameBoard.board,
            currentTurn,
          });
        } else {
          socket.emit('roomCreated', {
            roomCode: room.code,
            player: 'X',
          });
        }
      });

      socket.on('playMove', (payload: { roomCode: string; cellIndex: any }) => {
        console.log(`[EVENT: playMove] from=${socket.id} payload=${JSON.stringify(payload)}`);
        if (!payload || !payload.roomCode || payload.cellIndex === undefined) {
          return;
        }
        this.playMoveUseCase.execute(socket.id, payload.roomCode, payload.cellIndex);
      });

      socket.on('replay', (payload: { roomCode: string }) => {
        console.log(`[EVENT: replay] from=${socket.id} payload=${JSON.stringify(payload)}`);
        if (!payload || !payload.roomCode) {
          return;
        }
        this.restartGameUseCase.execute(socket.id, payload.roomCode);
      });

      socket.on('leaveRoom', () => {
        console.log(`[EVENT: leaveRoom] from=${socket.id}`);
        this.pendingHostRooms.delete(clientIp);
        this.handleDisconnectUseCase.execute(socket.id);
      });

      socket.on('disconnect', (reason: string) => {
        console.log(`[SOCKET DISCONNECT] id=${socket.id} ip=${clientIp} reason=${reason}`);
        this.handleDisconnectUseCase.execute(socket.id);
      });
    });
  }
}
