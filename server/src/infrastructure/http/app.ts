import express, { Express } from 'express';
import cors from 'cors';
import { IRoomRepository } from '../../application/ports/IRoomRepository';

export function createExpressApp(roomRepository?: IRoomRepository): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({
      name: 'Tic-Tac-Toe Apocalypse Relay Server',
      status: 'ONLINE',
      mode: 'Pip-Boy Radio Quantum Net',
    });
  });

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/rooms', (_req, res) => {
    if (!roomRepository) {
      res.json({ count: 0, rooms: [] });
      return;
    }
    const all = roomRepository.getAll();
    res.json({
      count: all.length,
      rooms: all.map((r) => ({
        code: r.code,
        hasHost: Boolean(r.host),
        hasGuest: Boolean(r.guest),
        isFull: r.isFull(),
        status: r.gameBoard.status.kind,
      })),
    });
  });

  return app;
}
