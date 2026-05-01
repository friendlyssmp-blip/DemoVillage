import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Building Placement Endpoint
  app.post('/api/village/building/place', (req, res) => {
    const { userId, typeId, position } = req.body;
    console.log(`User ${userId} placed ${typeId} at ${JSON.stringify(position)}`);
    // Here we would validate resources and space in a real DB
    res.json({ success: true, buildingId: `srv-${Date.now()}` });
  });

  // Resource Collection Endpoint
  app.post('/api/village/collect', (req, res) => {
    const { userId, buildingId } = req.body;
    // Calculate production based on last sync
    res.json({ success: true, collected: { gold: 100 } });
  });

  // Example: Server-side Combat Validation Placeholder
  app.post('/api/combat/resolve', (req, res) => {
    const { attacker, defender, actions } = req.body;
    // In a real server-authoritative app, we would re-run the simulation here.
    // For now, we'll return a stub indicating server-side processing.
    console.log(`Resolving combat for ${attacker} vs ${defender}`);
    res.json({ 
      success: true, 
      result: 'victory', 
      destruction: 100,
      reward: { gold: 500, trophies: 30 } 
    });
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
