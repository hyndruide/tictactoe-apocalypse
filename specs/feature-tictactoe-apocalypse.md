# Cadrage Fonctionnel : Tic Tac Toe Apocalypse

## 1. Contexte & Problème
- **Cible :** 2 joueurs sur le même appareil mobile
- **Problème résolu :** Avoir un jeu de morpion rapide, fun et stylé sans connexion réseau
- **Bénéfice attendu :** Une expérience pass-and-play immersive dans un univers post-apocalyptique Fallout

---

## 2. Périmètre

### Inclus (MVP)
- Grille 3×3 classique
- 2 joueurs : X et O (pas de saisie de nom)
- Alternance automatique des tours
- Détection victoire (3 alignés) et match nul
- Message de statut en jeu (ex. : "Tour de X" / "Tour de O")
- Écran de victoire avec imitation Vault Boy triomphant + message "Joueur X a gagné !" ou "Joueur O a gagné !"
- Bouton "Rejouer" sur l'écran de victoire
- Style visuel Pip-Boy : fond noir, texte et éléments vert phosphorescent, police rétro

### Exclu (Hors périmètre)
- Saisie de noms de joueurs
- Mode solo contre l'IA
- Scores cumulés / historique de parties
- Animations complexes
- Multijoueur en ligne
- Sons / musique

---

## 3. Parcours Utilisateur & Récits (User Stories)

**En tant que joueur, je veux voir clairement à qui c'est le tour, afin de ne pas me tromper.**

**En tant que joueur, je veux voir un écran de victoire immersif quand je gagne, afin de savourer ma victoire.**

### Scénario nominal
1. L'app s'ouvre sur la grille 3×3 vide, style Pip-Boy
2. Un message indique "Tour de X"
3. X tape une case → son symbole apparaît, le message passe à "Tour de O"
4. Les joueurs alternent jusqu'à victoire ou match nul
5. **Victoire :** L'écran de victoire s'affiche avec le Vault Boy triomphant et "Joueur X a gagné !" (ou O)
6. **Match nul :** Un message "Match nul !" s'affiche (sur l'écran de jeu ou une variante de l'écran de fin)
7. Le bouton "Rejouer" réinitialise la grille et repart au tour de X

---

## 4. Règles Métier & États Limites

- **Tour initial :** X commence toujours en premier
- **Case déjà jouée :** Le tap est ignoré silencieusement (pas d'erreur affichée)
- **Victoire :** Dès que 3 symboles identiques sont alignés (ligne, colonne, diagonale), la partie s'arrête immédiatement et l'écran de victoire s'affiche
- **Match nul :** Si toutes les cases sont remplies sans vainqueur, afficher "Match nul !" avec un bouton "Rejouer"
- **Rejouer :** Réinitialise la grille, X reprend toujours le premier tour

---

## 5. Critères d'Acceptation (Format Gherkin)

```gherkin
Étant donné que la partie vient de démarrer,
Quand l'écran s'affiche,
Alors la grille est vide et le message indique "Tour de X".

Étant donné que c'est le tour de X,
Quand X tape une case vide,
Alors un "X" apparaît dans la case et le message passe à "Tour de O".

Étant donné que c'est le tour de X,
Quand X tape une case déjà occupée,
Alors rien ne se passe et c'est toujours le tour de X.

Étant donné que X vient d'aligner 3 symboles,
Quand la victoire est détectée,
Alors l'écran de victoire s'affiche avec le Vault Boy triomphant et le texte "Joueur X a gagné !".

Étant donné que toutes les cases sont remplies sans vainqueur,
Quand la dernière case est jouée,
Alors un message "Match nul !" s'affiche avec un bouton "Rejouer".

Étant donné que l'écran de victoire ou de match nul est affiché,
Quand le joueur appuie sur "Rejouer",
Alors la grille se réinitialise, vide, et le message indique "Tour de X".
```
