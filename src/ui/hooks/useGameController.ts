import { useCallback, useState } from 'react';
import { Board, CellIndex, GameState, GameStatus } from '../../domain/types';
import { IGameUseCases } from '../../application/IGameUseCases';
import { defaultGameUseCases } from '../../application/gameUseCases';

export type GameController = {
  board: Board;
  status: GameStatus;
  handleCellPress: (index: CellIndex) => void;
  handleReplay: () => void;
};

export function useGameController(
  useCases: IGameUseCases = defaultGameUseCases
): GameController {
  const [gameState, setGameState] = useState<GameState>(() => useCases.startGame());

  const handleCellPress = useCallback(
    (index: CellIndex) => {
      setGameState((currentState) => {
        const result = useCases.playMove(currentState, index);
        if (result.ok) {
          return result.value;
        }
        return currentState;
      });
    },
    [useCases]
  );

  const handleReplay = useCallback(() => {
    setGameState(useCases.resetGame());
  }, [useCases]);

  return {
    board: gameState.board,
    status: gameState.status,
    handleCellPress,
    handleReplay,
  };
}
