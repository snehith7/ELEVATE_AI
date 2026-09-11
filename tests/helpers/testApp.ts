import express, { Express } from 'express';
import { apiRouter } from '../../server/routes';
import { dbManager } from '../../server/db';
import { seedInitialData } from '../../server/seed';

let appInstance: Express | null = null;

export async function getTestApp(): Promise<Express> {
  if (appInstance) {
    return appInstance;
  }

  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Initialize in-memory or mongo db & initial seeded records
  await dbManager.init();
  await seedInitialData();

  // Mount API router
  app.use('/api', apiRouter);

  appInstance = app;
  return appInstance;
}
