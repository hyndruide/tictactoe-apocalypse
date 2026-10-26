import { useCallback, useEffect, useRef, useState } from 'react';
import { Board, CellIndex, GameStatus, Player } from '../../domain/types';
import { EMPTY_BOARD } from '../../domain/constants';
import { OnlineGameState, OnlineRoomPhase } from '../../domain/onlineTypes';
import {
  ISocketGameClient,
  defaultSocketGameClient,
} from '../../infrastructure/network/SocketGameClient';

export const DEFAULT_ONLINE_SERVER_URL = 'https://tictactoe.hyndruide.fr';

export type OnlineGameController = {
  state: OnlineGameState;
  serverUrl: string;
  setServerUrl: (url: string) => void;
  roomCodeInput: string;
  setRoomCodeInput: (code: string) => void;
  connectToServer: (url?: string) => void;
  handleCreateRoom: () => void;
  handleJoinRoom: () => void;
  handleCellPress: (index: CellIndex) => void;
  handleReplay: () => void;
  handleLeaveRoom: () => void;
};

export function useOnlineGameController(
  client: ISocketGameClient = defaultSocketGameClient,
  initialServerUrl: string = DEFAULT_ONLINE_SERVER_URL
): OnlineGameController {
  const [serverUrl, setServerUrl] = useState<string>(initialServerUrl);
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');

  const [state, setState] = useState<OnlineGameState>({
    connectionStatus: 'DISCONNECTED',
    roomPhase: 'LOBBY',
    roomCode: null,
    myPlayer: null,
    currentTurn: null,
    board: EMPTY_BOARD,
    status: { kind: 'PLAYING', currentPlayer: 'X' },
    errorMessage: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const connectToServer = useCallback(
    (targetUrl?: string) => {
      const urlToUse = targetUrl || serverUrl;
      setState((prev) => ({
        ...prev,
        connectionStatus: 'CONNECTING',
        errorMessage: null,
      }));

      client.connect(urlToUse, {
        onConnected: () => {
          setState((prev) => {
            if (prev.roomCode && prev.myPlayer && client.reconnectRoom) {
              client.reconnectRoom(prev.roomCode, prev.myPlayer);
            }
            return {
              ...prev,
              connectionStatus: 'CONNECTED',
              errorMessage: null,
            };
          });
        },
        onDisconnected: () => {
          setState((prev) => ({
            ...prev,
            connectionStatus: 'DISCONNECTED',
          }));
        },
        onRoomCreated: (data) => {
          setState((prev) => ({
            ...prev,
            roomPhase: 'WAITING_FOR_OPPONENT',
            roomCode: data.roomCode,
            myPlayer: data.player,
            currentTurn: 'X',
            board: EMPTY_BOARD,
            status: { kind: 'PLAYING', currentPlayer: 'X' },
            errorMessage: null,
          }));
        },
        onRoomJoined: (data) => {
          setState((prev) => ({
            ...prev,
            roomPhase: 'PLAYING',
            roomCode: data.roomCode,
            myPlayer: data.player,
            currentTurn: data.currentTurn,
            board: data.board,
            status: { kind: 'PLAYING', currentPlayer: data.currentTurn },
            errorMessage: null,
          }));
        },
        onGameStarted: (data) => {
          setState((prev) => ({
            ...prev,
            roomPhase: 'PLAYING',
            roomCode: data.roomCode,
            myPlayer: prev.myPlayer || data.player,
            currentTurn: data.currentTurn,
            board: data.board,
            status: { kind: 'PLAYING', currentPlayer: data.currentTurn },
            errorMessage: null,
          }));
        },
        onGameUpdated: (data) => {
          setState((prev) => {
            const nextPhase: OnlineRoomPhase =
              data.status.kind !== 'PLAYING' ? 'GAME_OVER' : 'PLAYING';
            return {
              ...prev,
              roomPhase: nextPhase,
              board: data.board,
              currentTurn: data.currentTurn,
              status: data.status,
              errorMessage: null,
            };
          });
        },
        onPlayerDisconnected: (data) => {
          setState((prev) => ({
            ...prev,
            roomPhase: 'OPPONENT_DISCONNECTED',
            errorMessage: data.message,
          }));
        },
        onError: (data) => {
          setState((prev) => ({
            ...prev,
            connectionStatus: prev.connectionStatus === 'CONNECTING' ? 'ERROR' : prev.connectionStatus,
            errorMessage: data.message,
          }));
        },
      });
    },
    [client, serverUrl]
  );

  const handleCreateRoom = useCallback(() => {
    if (!client.isConnected()) {
      connectToServer();
    }
    client.createRoom();
  }, [client, connectToServer]);

  const handleJoinRoom = useCallback(() => {
    const cleanedCode = roomCodeInput.trim().toUpperCase();
    if (!cleanedCode) {
      setState((prev) => ({
        ...prev,
        errorMessage: 'SAISISSEZ UN CODE DE PARTIE VALIDE',
      }));
      return;
    }
    if (!client.isConnected()) {
      connectToServer();
    }
    client.joinRoom(cleanedCode);
  }, [client, connectToServer, roomCodeInput]);

  const handleCellPress = useCallback(
    (index: CellIndex) => {
      const current = stateRef.current;
      if (current.roomPhase !== 'PLAYING' || current.status.kind !== 'PLAYING') {
        return;
      }
      if (current.currentTurn !== current.myPlayer) {
        return;
      }
      if (current.board[index] !== null) {
        return;
      }
      if (!current.roomCode) {
        return;
      }
      client.playMove(current.roomCode, index);
    },
    [client]
  );

  const handleReplay = useCallback(() => {
    const current = stateRef.current;
    if (current.roomCode) {
      client.replay(current.roomCode);
    }
  }, [client]);

  const handleLeaveRoom = useCallback(() => {
    const current = stateRef.current;
    if (current.roomCode) {
      client.leaveRoom(current.roomCode);
    }
    setState((prev) => ({
      ...prev,
      roomPhase: 'LOBBY',
      roomCode: null,
      myPlayer: null,
      currentTurn: null,
      board: EMPTY_BOARD,
      status: { kind: 'PLAYING', currentPlayer: 'X' },
      errorMessage: null,
    }));
  }, [client]);

  return {
    state,
    serverUrl,
    setServerUrl,
    roomCodeInput,
    setRoomCodeInput,
    connectToServer,
    handleCreateRoom,
    handleJoinRoom,
    handleCellPress,
    handleReplay,
    handleLeaveRoom,
  };
}
