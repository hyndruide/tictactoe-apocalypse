import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createExpressApp } from './infrastructure/http/app';
import { InMemoryRoomRepository } from './infrastructure/repositories/InMemoryRoomRepository';
import { SocketIOEventEmitter } from './infrastructure/events/SocketIOEventEmitter';
import { CreateRoomUseCase } from './application/useCases/CreateRoomUseCase';
import { JoinRoomUseCase } from './application/useCases/JoinRoomUseCase';
import { PlayMoveUseCase } from './application/useCases/PlayMoveUseCase';
import { HandleDisconnectUseCase } from './application/useCases/HandleDisconnectUseCase';
import { RestartGameUseCase } from './application/useCases/RestartGameUseCase';
import { SocketIOAdapter } from './infrastructure/adapters/SocketIOAdapter';

const PORT = process.env.PORT || 8011;

const app = createExpressApp();
const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Hexagonal dependency injection
const roomRepository = new InMemoryRoomRepository();
const eventEmitter = new SocketIOEventEmitter(io);

const createRoomUseCase = new CreateRoomUseCase(roomRepository, eventEmitter);
const joinRoomUseCase = new JoinRoomUseCase(roomRepository, eventEmitter);
const playMoveUseCase = new PlayMoveUseCase(roomRepository, eventEmitter);
const handleDisconnectUseCase = new HandleDisconnectUseCase(roomRepository, eventEmitter);
const restartGameUseCase = new RestartGameUseCase(roomRepository, eventEmitter);

const socketAdapter = new SocketIOAdapter(
  io,
  createRoomUseCase,
  joinRoomUseCase,
  playMoveUseCase,
  handleDisconnectUseCase,
  restartGameUseCase
);

socketAdapter.registerHandlers();

httpServer.listen(PORT, () => {
  console.log(`[VAULT-TEC RELAY] Serveur multijoueur actif sur le port ${PORT}`);
});

export { httpServer, app };
