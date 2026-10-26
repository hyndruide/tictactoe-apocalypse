import express, { Express } from 'express';
import cors from 'cors';

export function createExpressApp(): Express {
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

  return app;
}
