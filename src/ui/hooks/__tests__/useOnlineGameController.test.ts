import { act, renderHook } from '@testing-library/react-native';
import { useOnlineGameController } from '../useOnlineGameController';
import { ISocketGameClient, SocketEventCallbacks } from '../../../infrastructure/network/ISocketGameClient';
import { EMPTY_BOARD } from '../../../domain/constants';

class MockSocketGameClient implements ISocketGameClient {
  public callbacks: SocketEventCallbacks = {};
  public connected = false;
  public emittedEvents: Array<{ event: string; payload?: any }> = [];

  connect(url: string, callbacks: SocketEventCallbacks): void {
    this.connected = true;
    this.callbacks = callbacks;
    callbacks.onConnected?.();
  }

  disconnect(): void {
    this.connected = false;
    this.callbacks.onDisconnected?.();
  }

  createRoom(): void {
    this.emittedEvents.push({ event: 'createRoom' });
  }

  joinRoom(roomCode: string): void {
    this.emittedEvents.push({ event: 'joinRoom', payload: roomCode });
  }

  playMove(roomCode: string, cellIndex: any): void {
    this.emittedEvents.push({ event: 'playMove', payload: { roomCode, cellIndex } });
  }

  replay(roomCode: string): void {
    this.emittedEvents.push({ event: 'replay', payload: roomCode });
  }

  leaveRoom(roomCode: string): void {
    this.emittedEvents.push({ event: 'leaveRoom', payload: roomCode });
  }

  isConnected(): boolean {
    return this.connected;
  }
}

describe('useOnlineGameController', () => {
  let mockClient: MockSocketGameClient;

  beforeEach(() => {
    mockClient = new MockSocketGameClient();
  });

  it('starts in LOBBY phase with empty board and DISCONNECTED status', () => {
    const { result } = renderHook(() => useOnlineGameController(mockClient));

    expect(result.current.state.roomPhase).toBe('LOBBY');
    expect(result.current.state.connectionStatus).toBe('DISCONNECTED');
    expect(result.current.state.roomCode).toBeNull();
    expect(result.current.state.board).toEqual(EMPTY_BOARD);
  });

  it('connects to server and sets status to CONNECTED', () => {
    const { result } = renderHook(() => useOnlineGameController(mockClient));

    act(() => {
      result.current.connectToServer('http://localhost:8011');
    });

    expect(result.current.state.connectionStatus).toBe('CONNECTED');
  });

  it('handles room creation and transitions to WAITING_FOR_OPPONENT', () => {
    const { result } = renderHook(() => useOnlineGameController(mockClient));

    act(() => {
      result.current.handleCreateRoom();
    });

    expect(mockClient.emittedEvents).toContainEqual({ event: 'createRoom' });

    // Simulate server emitting roomCreated
    act(() => {
      mockClient.callbacks.onRoomCreated?.({
        roomCode: 'VAULT-01',
        player: 'X',
      });
    });

    expect(result.current.state.roomPhase).toBe('WAITING_FOR_OPPONENT');
    expect(result.current.state.roomCode).toBe('VAULT-01');
    expect(result.current.state.myPlayer).toBe('X');
  });

  it('shows error if joining with empty room code', () => {
    const { result } = renderHook(() => useOnlineGameController(mockClient));

    act(() => {
      result.current.handleJoinRoom();
    });

    expect(result.current.state.errorMessage).toBeTruthy();
  });

  it('joins room and transitions to PLAYING when game starts', () => {
    const { result } = renderHook(() => useOnlineGameController(mockClient));

    act(() => {
      result.current.setRoomCodeInput('VAULT-42');
    });

    act(() => {
      result.current.handleJoinRoom();
    });

    expect(mockClient.emittedEvents).toContainEqual({
      event: 'joinRoom',
      payload: 'VAULT-42',
    });

    act(() => {
      mockClient.callbacks.onGameStarted?.({
        roomCode: 'VAULT-42',
        player: 'O',
        board: EMPTY_BOARD,
        currentTurn: 'X',
      });
    });

    expect(result.current.state.roomPhase).toBe('PLAYING');
    expect(result.current.state.roomCode).toBe('VAULT-42');
    expect(result.current.state.myPlayer).toBe('O');
  });

  it('allows playing a move only when it is my turn', () => {
    const { result } = renderHook(() => useOnlineGameController(mockClient));

    // Player X in room
    act(() => {
      result.current.connectToServer();
      mockClient.callbacks.onRoomCreated?.({
        roomCode: 'VAULT-77',
        player: 'X',
      });
      mockClient.callbacks.onGameStarted?.({
        roomCode: 'VAULT-77',
        player: 'X',
        board: EMPTY_BOARD,
        currentTurn: 'X',
      });
    });

    expect(result.current.state.currentTurn).toBe('X');
    expect(result.current.state.myPlayer).toBe('X');

    act(() => {
      result.current.handleCellPress(4); // Center cell
    });

    expect(mockClient.emittedEvents).toContainEqual({
      event: 'playMove',
      payload: { roomCode: 'VAULT-77', cellIndex: 4 },
    });
  });

  it('updates state on gameUpdated and transitions to GAME_OVER on win', () => {
    const { result } = renderHook(() => useOnlineGameController(mockClient));

    act(() => {
      result.current.connectToServer();
      mockClient.callbacks.onGameStarted?.({
        roomCode: 'VAULT-77',
        player: 'X',
        board: EMPTY_BOARD,
        currentTurn: 'X',
      });
    });

    const winningBoard: any = ['X', 'X', 'X', 'O', 'O', null, null, null, null];

    act(() => {
      mockClient.callbacks.onGameUpdated?.({
        board: winningBoard,
        currentTurn: 'O',
        status: { kind: 'WON', winner: 'X' },
      });
    });

    expect(result.current.state.roomPhase).toBe('GAME_OVER');
    expect(result.current.state.status.kind).toBe('WON');
  });
});
