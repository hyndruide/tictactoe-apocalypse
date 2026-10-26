# Architecture Technique — Tic Tac Toe Apocalypse

## 1. Vue d'ensemble

Architecture **Hexagonale (Ports & Adapters)** appliquée à un contexte mobile
(React Native / Expo). Le domaine métier est totalement isolé du framework UI.

```
┌─────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE                        │
│  ┌─────────────────┐        ┌──────────────────────┐   │
│  │  React Native   │        │   AsyncStorage /      │   │
│  │  UI Components  │        │   (hors périmètre)    │   │
│  │  (Adapters IN)  │        │   (Adapters OUT)      │   │
│  └────────┬────────┘        └──────────────────────┘   │
│           │ appelle                                      │
└───────────┼─────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────┐
│                  APPLICATION LAYER                       │
│         (Use Cases / Ports d'entrée)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │  startGame()  │  playMove()  │  resetGame()      │   │
│  └──────────────────────────────────────────────────┘   │
└───────────┬─────────────────────────────────────────────┘
            │ orchestre
┌───────────▼─────────────────────────────────────────────┐
│                    DOMAIN LAYER                          │
│         (Entités, Règles métier, Types)                  │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │  GameState   │  │  BoardLogic   │  │  GameResult │  │
│  └──────────────┘  └───────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Modélisation du Domaine

### 2.1 Types fondamentaux

```typescript
// Valeurs possibles d'une case
type CellValue = 'X' | 'O' | null;

// Index de case : 0 à 8 (grille 3×3 linéarisée)
type CellIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Joueur actif
type Player = 'X' | 'O';

// Représentation de la grille (tuple immuable de 9 cases)
type Board = readonly [
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue
];

// Statut de la partie
type GameStatus =
  | { kind: 'PLAYING'; currentPlayer: Player }
  | { kind: 'WON';    winner: Player }
  | { kind: 'DRAW' };

// État complet de la partie (entité racine)
type GameState = {
  readonly board: Board;
  readonly status: GameStatus;
};
```

### 2.2 Constantes de domaine

```typescript
// Les 8 combinaisons gagnantes (indices dans le Board)
const WIN_COMBINATIONS: readonly (readonly [CellIndex, CellIndex, CellIndex])[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
  [0, 4, 8], [2, 4, 6],             // diagonales
];
```

### 2.3 Résultats typés (pas d'exceptions silencieuses)

```typescript
type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

type MoveError =
  | 'CELL_ALREADY_OCCUPIED'
  | 'GAME_ALREADY_OVER';
```

---

## 3. Logique de Domaine Pure (BoardLogic)

Fonctions pures, sans effet de bord, sans dépendance externe.

```
BoardLogic
├── createInitialState(): GameState
├── applyMove(state: GameState, index: CellIndex): Result<GameState, MoveError>
├── checkWinner(board: Board, player: Player): boolean   [privée]
├── isBoardFull(board: Board): boolean                   [privée]
└── nextPlayer(current: Player): Player                  [privée]
```

**Invariants garantis par `applyMove` :**
- Si `status.kind !== 'PLAYING'` → erreur `GAME_ALREADY_OVER`
- Si `board[index] !== null` → erreur `CELL_ALREADY_OCCUPIED`
- Après placement, évalue victoire puis match nul, puis change de joueur
- Retourne un **nouveau** `GameState` (immuabilité stricte)

---

## 4. Ports d'Entrée (Use Cases Application)

```typescript
interface IGameUseCases {
  /**
   * Crée une nouvelle partie fraîche.
   * X commence toujours.
   */
  startGame(): GameState;

  /**
   * Tente de jouer sur la case `index`.
   * Retourne le nouvel état ou une erreur typée.
   */
  playMove(
    state: GameState,
    index: CellIndex
  ): Result<GameState, MoveError>;

  /**
   * Réinitialise la partie (équivalent à startGame).
   * Séparé sémantiquement pour l'intention UI "Rejouer".
   */
  resetGame(): GameState;
}
```

> **Note :** Pour ce MVP sans persistance, `IGameUseCases` est implémenté
> directement par un service applicatif pur. Aucun port de sortie
> (persistence) n'est requis dans ce périmètre.

---

## 5. Ports de Sortie (Interfaces Infrastructure)

Aucun port de sortie actif dans le MVP (pas de persistance, pas de réseau).
L'interface est néanmoins définie pour extensibilité future :

```typescript
// Port de sortie — hors périmètre MVP, défini pour contrat futur
interface IGameRepository {
  save(state: GameState): Promise<void>;
  load(): Promise<GameState | null>;
}
```

---

## 6. Couche UI (Adaptateur entrant)

La UI React Native consomme uniquement `IGameUseCases`.
Elle maintient l'état courant via un hook `useGameController` qui :
- Détient le `GameState` courant (state local React)
- Délègue toute logique à `IGameUseCases`
- Ne contient **aucune** règle métier

```
Screens
├── GameScreen          — grille + message de statut
└── EndScreen           — victoire / match nul + bouton Rejouer

Components
├── Board               — rendu des 9 cases
├── Cell                — case individuelle (tap handler)
├── StatusBar           — "Tour de X / O"
└── VaultBoyDisplay     — illustration + message fin de partie

Hooks
└── useGameController   — pont entre UI et Use Cases
```

---

## 7. Contrats d'Échange UI ↔ Use Cases

Comme l'application est **100% locale** (pas d'API HTTP), les contrats
d'échange sont des **interfaces TypeScript** et non des routes REST.

### 7.1 Contrat `useGameController` (hook)

```typescript
type GameController = {
  // État courant exposé à la UI
  board: Board;
  status: GameStatus;

  // Actions
  handleCellPress: (index: CellIndex) => void;
  handleReplay: () => void;
};
```

### 7.2 Flux de données (séquence)

```
[User taps Cell(3)]
      │
      ▼
useGameController.handleCellPress(3)
      │
      ▼
GameUseCases.playMove(currentState, 3)
      │
      ├─ ok: true  → setState(newGameState) → UI re-render
      └─ ok: false → état inchangé (tap ignoré silencieusement)
```

---

## 8. Structure de fichiers cible

```
src/
├── domain/
│   ├── types.ts              # CellValue, Player, Board, GameState, Result…
│   ├── boardLogic.ts         # Fonctions pures du domaine
│   └── constants.ts          # WIN_COMBINATIONS
├── application/
│   ├── IGameUseCases.ts      # Interface port d'entrée
│   └── gameUseCases.ts       # Implémentation (pure, sans I/O)
├── infrastructure/
│   └── IGameRepository.ts    # Port de sortie (contrat futur)
└── ui/
    ├── hooks/
    │   └── useGameController.ts
    ├── screens/
    │   ├── GameScreen.tsx
    │   └── EndScreen.tsx
    └── components/
        ├── Board.tsx
        ├── Cell.tsx
        ├── StatusBar.tsx
        └── VaultBoyDisplay.tsx
```

---

## 9. Stratégie de tests

| Couche       | Type          | Outil suggéré | Ce qui est testé                              |
|--------------|---------------|---------------|-----------------------------------------------|
| Domain       | Unitaire      | Jest          | `boardLogic` : victoire, nul, erreurs, immuabilité |
| Application  | Unitaire      | Jest          | `gameUseCases` : orchestration des cas d'usage |
| UI / Hook    | Intégration   | RNTL          | `useGameController` : flux complet sans mock domaine |
| Components   | Snapshot/UI   | RNTL          | Rendu conditionnel selon `GameStatus`         |

> Règle Constitution : **aucun mock sur le domaine**. Les tests unitaires
> appellent directement `boardLogic` et `gameUseCases` avec des données en dur.

---

## 10. Architecture Technique — Multijoueur en ligne (Tic-Tac-Toe)

### 10.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Mobile)                       │
│                    React Native / Expo                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ WebSocket (Socket.io-client)
┌──────────────────────────▼──────────────────────────────────┐
│                   ADAPTATEUR ENTRANT                         │
│              SocketIOAdapter (infrastructure)                 │
│   Traduit les événements Socket.io en appels Use Cases       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                      Use Cases (Ports IN)                    │
│  CreateRoom | JoinRoom | PlayMove | HandleDisconnect         │
└──────┬───────────────────┬──────────────────────────────────┘
       │                   │
┌──────▼──────┐   ┌────────▼────────────────────────────────┐
│   DOMAINE   │   │         PORTS SORTANTS (interfaces)      │
│  Entities   │   │  IRoomRepository | IEventEmitter         │
│  GameBoard  │   └────────┬────────────────────────────────┘
│  Room       │            │
│  Player     │   ┌────────▼────────────────────────────────┐
└─────────────┘   │         ADAPTATEURS SORTANTS             │
                  │  InMemoryRoomRepository                  │
                  │  SocketIOEventEmitter                    │
                  └─────────────────────────────────────────┘
```

### 10.2 Stack Technique

| Couche         | Technologie                          | Justification                          |
|----------------|--------------------------------------|----------------------------------------|
| Serveur        | Node.js 20 LTS + TypeScript strict   | Typage fort, écosystème Socket.io      |
| Temps réel     | Socket.io 4.x                        | Gestion rooms, reconnexion, events     |
| HTTP minimal   | Express 4.x                          | Health-check endpoint uniquement       |
| Persistance    | In-Memory (Map<string, Room>)        | Persistance rapide en mémoire          |
| Client         | React Native + Expo SDK              | Saisie code de partie & client Socket  |
| Tests          | Jest + RNTL                          | 100% de tests automatisés              |

