import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { OnlineGameScreen } from '../OnlineGameScreen';
import { OnlineGameController } from '../../hooks/useOnlineGameController';
import { EMPTY_BOARD } from '../../../domain/constants';

describe('OnlineGameScreen', () => {
  const createMockController = (overrides?: Partial<OnlineGameController>): OnlineGameController => ({
    state: {
      connectionStatus: 'DISCONNECTED',
      roomPhase: 'LOBBY',
      roomCode: null,
      myPlayer: null,
      currentTurn: null,
      board: EMPTY_BOARD,
      status: { kind: 'PLAYING', currentPlayer: 'X' },
      errorMessage: null,
    },
    serverUrl: 'http://localhost:8011',
    setServerUrl: jest.fn(),
    roomCodeInput: '',
    setRoomCodeInput: jest.fn(),
    connectToServer: jest.fn(),
    handleCreateRoom: jest.fn(),
    handleJoinRoom: jest.fn(),
    handleCellPress: jest.fn(),
    handleReplay: jest.fn(),
    handleLeaveRoom: jest.fn(),
    ...overrides,
  });

  it('renders LOBBY with room code input and action buttons', () => {
    const onBackToLocal = jest.fn();
    const controller = createMockController();

    const { getByTestId, getByText } = render(
      <OnlineGameScreen onBackToLocal={onBackToLocal} controller={controller} />
    );

    expect(getByText(/RELAIS RADIO MULTIJOUEUR/)).toBeTruthy();
    expect(getByTestId('room-code-input')).toBeTruthy();
    expect(getByTestId('join-room-button')).toBeTruthy();
    expect(getByTestId('create-room-button')).toBeTruthy();
    expect(getByTestId('back-to-local-button')).toBeTruthy();

    fireEvent.press(getByTestId('back-to-local-button'));
    expect(onBackToLocal).toHaveBeenCalled();
  });

  it('triggers handleJoinRoom on button press', () => {
    const handleJoinRoom = jest.fn();
    const controller = createMockController({
      roomCodeInput: 'VAULT-99',
      handleJoinRoom,
    });

    const { getByTestId } = render(
      <OnlineGameScreen onBackToLocal={jest.fn()} controller={controller} />
    );

    fireEvent.press(getByTestId('join-room-button'));
    expect(handleJoinRoom).toHaveBeenCalled();
  });

  it('triggers handleCreateRoom on create button press', () => {
    const handleCreateRoom = jest.fn();
    const controller = createMockController({
      handleCreateRoom,
    });

    const { getByTestId } = render(
      <OnlineGameScreen onBackToLocal={jest.fn()} controller={controller} />
    );

    fireEvent.press(getByTestId('create-room-button'));
    expect(handleCreateRoom).toHaveBeenCalled();
  });

  it('displays room code and waiting indicator when phase is WAITING_FOR_OPPONENT', () => {
    const controller = createMockController({
      state: {
        connectionStatus: 'CONNECTED',
        roomPhase: 'WAITING_FOR_OPPONENT',
        roomCode: 'VAULT-77',
        myPlayer: 'X',
        currentTurn: 'X',
        board: EMPTY_BOARD,
        status: { kind: 'PLAYING', currentPlayer: 'X' },
        errorMessage: null,
      },
    });

    const { getByTestId, getByText } = render(
      <OnlineGameScreen onBackToLocal={jest.fn()} controller={controller} />
    );

    expect(getByTestId('display-room-code')).toBeTruthy();
    expect(getByText('VAULT-77')).toBeTruthy();
    expect(getByTestId('waiting-opponent')).toBeTruthy();
    expect(getByTestId('cancel-room-button')).toBeTruthy();
  });

  it('displays board and player turn when phase is PLAYING', () => {
    const handleCellPress = jest.fn();
    const controller = createMockController({
      state: {
        connectionStatus: 'CONNECTED',
        roomPhase: 'PLAYING',
        roomCode: 'VAULT-77',
        myPlayer: 'X',
        currentTurn: 'X',
        board: EMPTY_BOARD,
        status: { kind: 'PLAYING', currentPlayer: 'X' },
        errorMessage: null,
      },
      handleCellPress,
    });

    const { getByTestId, getByText } = render(
      <OnlineGameScreen onBackToLocal={jest.fn()} controller={controller} />
    );

    expect(getByText(/VOUS ÊTES :/)).toBeTruthy();
    expect(getByTestId('my-turn-indicator')).toBeTruthy();
    expect(getByTestId('cell-0')).toBeTruthy();

    act(() => {
      fireEvent.press(getByTestId('cell-0'));
    });
    expect(handleCellPress).toHaveBeenCalledWith(0);
  });

  it('displays disconnection message when phase is OPPONENT_DISCONNECTED', () => {
    const controller = createMockController({
      state: {
        connectionStatus: 'CONNECTED',
        roomPhase: 'OPPONENT_DISCONNECTED',
        roomCode: 'VAULT-77',
        myPlayer: 'X',
        currentTurn: null,
        board: EMPTY_BOARD,
        status: { kind: 'PLAYING', currentPlayer: 'X' },
        errorMessage: 'Liaison interrompue.',
      },
    });

    const { getByTestId, getByText } = render(
      <OnlineGameScreen onBackToLocal={jest.fn()} controller={controller} />
    );

    expect(getByTestId('opponent-disconnected-message')).toBeTruthy();
    expect(getByText(/SIGNAL PERDU/)).toBeTruthy();
    expect(getByTestId('return-lobby-button')).toBeTruthy();
  });
});
