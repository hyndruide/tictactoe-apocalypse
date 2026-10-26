# ☢️ Tic Tac Toe Apocalypse

[![Server CI / CD](https://github.com/hyndruide/tictactoe-apocalypse/actions/workflows/server-ci.yml/badge.svg)](https://github.com/hyndruide/tictactoe-apocalypse/actions/workflows/server-ci.yml)
[![Build Android APK](https://github.com/hyndruide/tictactoe-apocalypse/actions/workflows/build-apk.yml/badge.svg)](https://github.com/hyndruide/tictactoe-apocalypse/actions/workflows/build-apk.yml)
[![Production Relay](https://img.shields.io/badge/Production%20Relay-tictactoe.hyndruide.fr-brightgreen)](https://tictactoe.hyndruide.fr/health)
[![Latest APK](https://img.shields.io/github/v/release/hyndruide/tictactoe-apocalypse?label=APK%20Release)](https://github.com/hyndruide/tictactoe-apocalypse/releases/latest)

Jeu de morpion post-apocalyptique rétro Pip-Boy développé en React Native (Expo) avec relais multijoueur en ligne WebSocket temps réel.

---

## 🏗️ Architecture du Projet

Le projet est structuré en **Monorepo Clean Architecture** :

```text
tictactoe-apocalypse/
├── android/                   # Projet natif Android (Gradle)
├── src/                       # Application mobile React Native
│   ├── domain/                # Règles métier pures du morpion
│   ├── application/           # Cas d'usage de jeu
│   ├── infrastructure/        # Client réseau Socket.io
│   └── ui/                    # Écrans et composants Pip-Boy
├── server/                    # Relais multijoueur temps réel (Node.js / Express / Socket.io)
│   ├── src/domain/            # Entités (Room, Player, GameBoard)
│   ├── src/application/       # Cas d'usage (CreateRoom, JoinRoom, PlayMove, HandleDisconnect)
│   ├── src/infrastructure/    # Adaptateur Socket.IO, serveur HTTP Express
│   ├── Dockerfile             # Image multi-stage non-root alpine
│   └── docker-compose.prod.yml# Déploiement Kimsufi avec labels Traefik SSL & Anti-DoS
└── .github/workflows/
    ├── server-ci.yml          # CI/CD Serveur : TypeScript, Jest, Docker build, Healthcheck live
    └── build-apk.yml          # CI Mobile : Compilation APK Android Standalone
```

---

## ⚡ Pipelines CI/CD GitHub Actions

| Pipeline | Fichier | Déclenchement | Description |
|---|---|---|---|
| **Server CI / CD** | [`.github/workflows/server-ci.yml`](.github/workflows/server-ci.yml) | Modifs sur `server/**` ou manuel | Compilation TypeScript, tests unitaires Jest, build conteneur Docker multi-stage et vérification de santé live. |
| **Build Android APK** | [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml) | Modifs sur `src/**`, `android/**` | Compilation Gradle de l'APK Release autonome téléchargeable. |

---

## 🌐 Relais Multijoueur en Production

* **URL Publique Sécurisée** : [`https://tictactoe.hyndruide.fr`](https://tictactoe.hyndruide.fr)
* **Sonde de santé** : [`https://tictactoe.hyndruide.fr/health`](https://tictactoe.hyndruide.fr/health)
* **Salons actifs en direct** : [`https://tictactoe.hyndruide.fr/rooms`](https://tictactoe.hyndruide.fr/rooms)
* **Infrastructure** : Serveur Kimsufi OVH (`54.36.110.34`), Traefik v2 SSL Let's Encrypt, conteneur non-root sous Docker avec protection rate-limiting et buffer DoS.

---

## 📲 Téléchargement Mobile

👉 **[Télécharger le dernier APK Android autonome](https://github.com/hyndruide/tictactoe-apocalypse/releases/latest)**

*Projet industrialisé par la Software Factory.*
