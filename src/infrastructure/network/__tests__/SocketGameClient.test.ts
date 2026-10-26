import { SocketGameClient } from '../SocketGameClient';
import { io } from 'socket.io-client';

jest.mock('socket.io-client');

describe('SocketGameClient', () => {
  let mockSocket: any;
  let client: SocketGameClient;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      removeAllListeners: jest.fn(),
      connected: false,
    };
    (io as unknown as jest.Mock).mockReturnValue(mockSocket);
    client = new SocketGameClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('connects to the given url and registers socket events', () => {
    const callbacks = {
      onConnected: jest.fn(),
      onRoomCreated: jest.fn(),
      onGameStarted: jest.fn(),
      onGameUpdated: jest.fn(),
      onError: jest.fn(),
    };

    client.connect('http://localhost:8011', callbacks);

    expect(io).toHaveBeenCalledWith('http://localhost:8011', expect.objectContaining({
      transports: ['websocket'],
    }));

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('roomCreated', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('gameStarted', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('gameUpdated', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('triggers onRoomCreated callback when event received', () => {
    const callbacks = {
      onRoomCreated: jest.fn(),
    };

    client.connect('http://localhost:8011', callbacks);

    const roomCreatedHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === 'roomCreated'
    )[1];

    roomCreatedHandler({ roomCode: 'VAULT-99', player: 'X' });
    expect(callbacks.onRoomCreated).toHaveBeenCalledWith({
      roomCode: 'VAULT-99',
      player: 'X',
    });
  });

  it('emits createRoom event', () => {
    client.connect('http://localhost:8011', {});
    client.createRoom();
    expect(mockSocket.emit).toHaveBeenCalledWith('createRoom');
  });

  it('emits joinRoom event with uppercase room code', () => {
    client.connect('http://localhost:8011', {});
    client.joinRoom('vault-42');
    expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', {
      roomCode: 'VAULT-42',
    });
  });

  it('emits playMove event', () => {
    client.connect('http://localhost:8011', {});
    client.playMove('VAULT-42', 4);
    expect(mockSocket.emit).toHaveBeenCalledWith('playMove', {
      roomCode: 'VAULT-42',
      cellIndex: 4,
    });
  });

  it('emits replay event', () => {
    client.connect('http://localhost:8011', {});
    client.replay('VAULT-42');
    expect(mockSocket.emit).toHaveBeenCalledWith('replay', {
      roomCode: 'VAULT-42',
    });
  });

  it('disconnects socket properly', () => {
    client.connect('http://localhost:8011', {});
    client.disconnect();
    expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
