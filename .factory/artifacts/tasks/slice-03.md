# Slice 03 — UI Hook : useGameController

## Objectif
Créer le pont entre la UI React Native et les Use Cases.
Contient l'état React local. Zéro logique métier.

## Fichiers à créer
- `src/ui/hooks/useGameController.ts`

## Dépendances
- Slice 01 + Slice 02 complétés

---

## Contrat du hook

```typescript
type GameController = {
  board: Board;
  status: GameStatus;
  handleCellPress: (index: CellIndex) => void;
  handleReplay: () => void;
};

function useGameController(): GameController;
```

---

## Comportement interne

```
État interne : gameState (useState<GameState>)

Initialisation :
  gameState = gameUseCases.startGame()

handleCellPress(index):
  result = gameUseCases.playMove(gameState, index)
  if result.ok → setGameState(result.value)
  if !result.ok → ne rien faire (tap ignoré silencieusement)

handleReplay():
  setGameState(gameUseCases.resetGame())
```

---

## Contrats d'entrée / sortie exacts

### Valeurs exposées
| Propriété         | Type          | Description                              |
|-------------------|---------------|------------------------------------------|
| `board`           | `Board`       | Les 9 cases courantes                    |
| `status`          | `GameStatus`  | PLAYING / WON / DRAW avec métadonnées    |
| `handleCellPress` | `(CellIndex) => void` | Joue un coup, ignore les erreurs |
| `handleReplay`    | `() => void`  | Réinitialise la partie                   |

---

## Critères d'acceptation Gherkin

```gherkin
# --- Initialisation ---

Étant donné que le hook est monté,
Quand useGameController() est appelé,
Alors board contient 9 valeurs null
  Et status est { kind: 'PLAYING', currentPlayer: 'X' }.

# --- Coup valide ---

Étant donné que le hook est initialisé,
Quand handleCellPress(0) est appelé,
Alors board[0] vaut 'X'
  Et status.currentPlayer vaut 'O'.

# --- Coup invalide (case occupée) ---

Étant donné que board[0] = 'X',
Quand handleCellPress(0) est appelé à nouveau,
Alors board[0] vaut toujours 'X'
  Et status est inchangé.

# --- Rejouer ---

Étant donné que status.kind = 'WON',
Quand handleReplay() est appelé,
Alors board contient 9 valeurs null
  Et status est { kind: 'PLAYING', currentPlayer: 'X' }.
```

## Tests requis
- Fichier : `src/ui/hooks/__tests__/useGameController.test.ts`
- Outil : React Native Testing Library + `renderHook`
- Domaine appelé sans mock (intégration réelle)
