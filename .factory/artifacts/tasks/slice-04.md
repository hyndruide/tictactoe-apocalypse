# Slice 04 — UI : Composants & Écrans

## Objectif
Implémenter les composants visuels React Native avec le style Pip-Boy.
Aucune logique métier. Consomme uniquement `useGameController`.

## Fichiers à créer
- `src/ui/components/Cell.tsx`
- `src/ui/components/Board.tsx`
- `src/ui/components/StatusBar.tsx`
- `src/ui/components/VaultBoyDisplay.tsx`
- `src/ui/screens/GameScreen.tsx`
- `src/ui/screens/EndScreen.tsx`

## Dépendances
- Slice 03 complété

---

## Contrats de composants

### `Cell`
```typescript
type CellProps = {
  value: CellValue;           // null | 'X' | 'O'
  index: CellIndex;
  onPress: (index: CellIndex) => void;
  disabled: boolean;          // true si partie terminée
};
```

### `Board`
```typescript
type BoardProps = {
  board: Board;
  onCellPress: (index: CellIndex) => void;
  disabled: boolean;
};
```

### `StatusBar`
```typescript
type StatusBarProps = {
  status: GameStatus;
  // Affiche "Tour de X", "Tour de O", ou rien si partie terminée
};
```

### `VaultBoyDisplay`
```typescript
type VaultBoyDisplayProps = {
  result: { kind: 'WON'; winner: Player } | { kind: 'DRAW' };
  // Affiche "Joueur X a gagné !" / "Joueur O a gagné !" / "Match nul !"
};
```

### `GameScreen`
- Compose : `StatusBar` + `Board`
- Affiche `EndScreen` en overlay ou navigation si `status.kind !== 'PLAYING'`

### `EndScreen`
```typescript
type EndScreenProps = {
  status: GameStatus;          // WON ou DRAW
  onReplay: () => void;
};
// Compose : VaultBoyDisplay + Bouton "Rejouer"
```

---

## Style Pip-Boy (constantes partagées)

```typescript
const PIPBOY_THEME = {
  background: '#000000',
  primary: '#39FF14',      // vert phosphorescent
  fontFamily: 'monospace', // police rétro (ou custom Fallout)
  fontSize: { large: 24, medium: 18, small: 14 },
  borderColor: '#39FF14',
  borderWidth: 2,
};
```

---

## Critères d'acceptation Gherkin

```gherkin
# --- Affichage initial ---

Étant donné que la partie vient de démarrer,
Quand GameScreen s'affiche,
Alors 9 cases vides sont visibles
  Et le message "Tour de X" est affiché
  Et le fond est noir avec des éléments verts.

# --- Coup joué ---

Étant donné que GameScreen est affiché avec board vide,
Quand l'utilisateur appuie sur la case d'index 0,
Alors la case 0 affiche "X"
  Et le message passe à "Tour de O".

# --- Case occupée (UI) ---

Étant donné que la case 0 affiche "X",
Quand l'utilisateur appuie sur la case 0,
Alors rien ne change visuellement.

# --- Écran de victoire ---

Étant donné que status.kind = 'WON' avec winner = 'X',
Quand EndScreen s'affiche,
Alors le texte "Joueur X a gagné !" est visible
  Et le Vault Boy triomphant est affiché
  Et un bouton "Rejouer" est présent.

# --- Écran match nul ---

Étant donné que status.kind = 'DRAW',
Quand EndScreen s'affiche,
Alors le texte "Match nul !" est visible
  Et un bouton "Rejouer" est présent.

# --- Rejouer (UI) ---

Étant donné que EndScreen est affiché,
Quand l'utilisateur appuie sur "Rejouer",
Alors GameScreen s'affiche avec 9 cases vides
  Et le message indique "Tour de X".
```

## Tests requis
- Fichier : `src/ui/components/__tests__/` + `src/ui/screens/__tests__/`
- Outil : React Native Testing Library
- Tests de rendu conditionnel selon les props
