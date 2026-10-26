# Slice 02 — Application : Use Cases

## Objectif
Implémenter la couche application qui orchestre le domaine
et expose les ports d'entrée à la UI.

## Fichiers à créer
- `src/application/IGameUseCases.ts`
- `src/application/gameUseCases.ts`

## Dépendances
- Slice 01 complété (`domain/types`, `domain/boardLogic`)

---

## Interface à créer

### `src/application/IGameUseCases.ts`
```typescript
interface IGameUseCases {
  startGame(): GameState;
  playMove(state: GameState, index: CellIndex): Result<GameState, MoveError>;
  resetGame(): GameState;
}
```

### `src/application/gameUseCases.ts`
Implémentation concrète de `IGameUseCases` :
- `startGame()` → délègue à `createInitialState()`
- `playMove(state, index)` → délègue à `applyMove(state, index)`
- `resetGame()` → délègue à `createInitialState()`
  (sémantique distincte de `startGame` pour clarté d'intention UI)

---

## Contrats d'entrée / sortie exacts

### `startGame()`
- **Entrée :** aucune
- **Sortie :** `GameState` initial (board vide, X commence)

### `playMove(state, index)`
- **Entrée :** `GameState` courant + `CellIndex`
- **Sortie :** `Result<GameState, MoveError>` (délégation directe au domaine)

### `resetGame()`
- **Entrée :** aucune
- **Sortie :** `GameState` initial (identique à `startGame`)

---

## Critères d'acceptation Gherkin

```gherkin
# --- startGame ---

Étant donné que l'application démarre,
Quand startGame() est appelé,
Alors un GameState avec board vide et currentPlayer 'X' est retourné.

# --- playMove (délégation) ---

Étant donné un GameState PLAYING valide,
Quand playMove(state, index_libre) est appelé,
Alors le résultat ok: true contient le nouvel état mis à jour.

Étant donné un GameState PLAYING valide,
Quand playMove(state, index_occupé) est appelé,
Alors le résultat est { ok: false, error: 'CELL_ALREADY_OCCUPIED' }.

# --- resetGame ---

Étant donné une partie terminée (WON ou DRAW),
Quand resetGame() est appelé,
Alors un GameState avec board vide et currentPlayer 'X' est retourné
  Et l'état précédent n'est pas muté.
```

## Tests requis
- Fichier : `src/application/__tests__/gameUseCases.test.ts`
- Aucun mock du domaine (appels réels à `boardLogic`)
