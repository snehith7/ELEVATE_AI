import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { dbManager } from './server/db';
import { seedInitialData } from './server/seed';

async function startServer() {
  const app = express();
  // On Render, RENDER=true is set and PORT is provided by Render (usually 10000).
  // In the development/AI Studio container, PORT is strictly 3000.
  const PORT = process.env.RENDER ? (Number(process.env.PORT) || 10000) : 3000;

  // CORS middleware to support deployments where frontend & backend have different URLs
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // JSON request body parser
  app.use(express.json({ limit: '5mb' }));

  // Initialize Database connection & seed initial data
  try {
    await dbManager.init();
    await seedInitialData();
  } catch (err) {
    console.error('Error during database initialization:', err);
  }

  // Mount API routes
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CodeElevate AI Academy',
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CodeElevate AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
