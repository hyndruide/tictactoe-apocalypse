# Slice 01 — Domaine : Types & Logique Pure

## Objectif
Implémenter le cœur métier immuable et pur du jeu.
Zéro dépendance externe. Zéro framework.

## Fichiers à créer
- `src/domain/types.ts`
- `src/domain/constants.ts`
- `src/domain/boardLogic.ts`

---

## Entités & Types à créer

### `src/domain/types.ts`
```typescript
type CellValue = 'X' | 'O' | null;
type CellIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type Player = 'X' | 'O';
type Board = readonly [
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue
];
type GameStatus =
  | { kind: 'PLAYING'; currentPlayer: Player }
  | { kind: 'WON';    winner: Player }
  | { kind: 'DRAW' };
type GameState = {
  readonly board: Board;
  readonly status: GameStatus;
};
type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };
type MoveError = 'CELL_ALREADY_OCCUPIED' | 'GAME_ALREADY_OVER';
```

### `src/domain/constants.ts`
```typescript
const WIN_COMBINATIONS: readonly (readonly [CellIndex, CellIndex, CellIndex])[] = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];
const EMPTY_BOARD: Board = [null,null,null,null,null,null,null,null,null];
const INITIAL_PLAYER: Player = 'X';
```

### `src/domain/boardLogic.ts` — Signatures à implémenter
```typescript
// Crée un état initial vide, X commence
function createInitialState(): GameState

// Tente de jouer sur `index`, retourne Result
function applyMove(
  state: GameState,
  index: CellIndex
): Result<GameState, MoveError>

// [privée] Vérifie si `player` a gagné sur `board`
function checkWinner(board: Board, player: Player): boolean

// [privée] Vérifie si toutes les cases sont remplies
function isBoardFull(board: Board): boolean

// [privée] Retourne le joueur suivant
function nextPlayer(current: Player): Player
```

---

## Contrats d'entrée / sortie exacts

### `createInitialState()`
- **Entrée :** aucune
- **Sortie :**
```typescript
{
  board: [null,null,null,null,null,null,null,null,null],
  status: { kind: 'PLAYING', currentPlayer: 'X' }
}
```

### `applyMove(state, index)`
- **Entrée :** `GameState` valide + `CellIndex` (0–8)
- **Sortie (succès) :** `{ ok: true, value: GameState }` avec :
  - `board` : nouveau tableau immuable avec la case jouée
  - `status` : `WON` si victoire, `DRAW` si nul, sinon `PLAYING` avec joueur suivant
- **Sortie (erreur) :**
  - `{ ok: false, error: 'CELL_ALREADY_OCCUPIED' }` si case non nulle
  - `{ ok: false, error: 'GAME_ALREADY_OVER' }` si status ≠ PLAYING

---

## Critères d'acceptation Gherkin

```gherkin
# --- createInitialState ---

Étant donné qu'aucune partie n'est en cours,
Quand createInitialState() est appelé,
Alors le board retourné contient 9 valeurs null
  Et le status est { kind: 'PLAYING', currentPlayer: 'X' }.

# --- applyMove : coup valide ---

Étant donné un état PLAYING avec le board vide et currentPlayer 'X',
Quand applyMove(state, 4) est appelé,
Alors le résultat est ok: true
  Et board[4] vaut 'X'
  Et status est { kind: 'PLAYING', currentPlayer: 'O' }.

# --- applyMove : case occupée ---

Étant donné un état PLAYING avec board[4] = 'X',
Quand applyMove(state, 4) est appelé,
Alors le résultat est { ok: false, error: 'CELL_ALREADY_OCCUPIED' }
  Et l'état n'est pas modifié.

# --- applyMove : victoire ---

Étant donné un état PLAYING avec board = [X,X,null,O,O,null,null,null,null],
Quand applyMove(state, 2) est appelé (X joue case 2),
Alors le résultat est ok: true
  Et status est { kind: 'WON', winner: 'X' }.

# --- applyMove : match nul ---

Étant donné un état PLAYING avec 8 cases remplies sans vainqueur,
Quand applyMove(state, dernière_case_vide) est appelé,
Alors le résultat est ok: true
  Et status est { kind: 'DRAW' }.

# --- applyMove : partie terminée ---

Étant donné un état avec status.kind = 'WON',
Quand applyMove(state, 0) est appelé,
Alors le résultat est { ok: false, error: 'GAME_ALREADY_OVER' }.
```

## Dépendances
- Aucune (slice autonome, zéro import externe)

## Tests requis
- Fichier : `src/domain/__tests__/boardLogic.test.ts`
- Couverture : tous les scénarios Gherkin ci-dessus
- Aucun mock autorisé
