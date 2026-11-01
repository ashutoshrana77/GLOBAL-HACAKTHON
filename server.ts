import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyWithGemini } from './src/server/verificationEngine.js';
import {
  addVerification,
  getVerificationHistory,
  getVerificationById,
  computeDashboardStats,
  getMonitoredClaims,
  addMonitoredClaim,
  deleteMonitoredClaim,
} from './src/server/store.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route: Verify LLM Response
  app.post('/api/v1/verify', async (req, res) => {
    try {
      const { response, original_query, model_name, verification_depth } = req.body;
      if (!response || typeof response !== 'string' || !response.trim()) {
        return res.status(400).json({ error: 'Field "response" is required and cannot be empty.' });
      }

      const result = await verifyWithGemini(
        response.trim(),
        original_query?.trim() || undefined,
        model_name?.trim() || 'Custom Model',
        verification_depth || 'standard'
      );

      // Save to audit history
      addVerification(result);

      return res.json(result);
    } catch (err: any) {
      console.error('Error in /api/v1/verify:', err);
      return res.status(500).json({ error: err.message || 'Internal verification error' });
    }
  });

  // API Route: Verification Audit History
  app.get('/api/v1/history', (req, res) => {
    res.json(getVerificationHistory());
  });

  // API Route: Verification by ID
  app.get('/api/v1/history/:id', (req, res) => {
    const item = getVerificationById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Verification report not found' });
    }
    res.json(item);
  });

  // API Route: Computed Dashboard Stats
  app.get('/api/v1/stats', (req, res) => {
    res.json(computeDashboardStats());
  });

  // API Route: Continuous Monitoring List
  app.get('/api/v1/monitored', (req, res) => {
    res.json(getMonitoredClaims());
  });

  app.post('/api/v1/monitored', (req, res) => {
    const { claimText, category, topic, status, freshnessScore, interval, notes } = req.body;
    if (!claimText) {
      return res.status(400).json({ error: 'claimText is required' });
    }
    const created = addMonitoredClaim({
      claimText,
      category: category || 'TECH_DEVELOPMENT',
      topic: topic || 'Custom Monitor',
      status: status || 'VERIFIED',
      freshnessScore: typeof freshnessScore === 'number' ? freshnessScore : 95,
      interval: interval || 'DAILY',
      notes,
    });
    res.status(201).json(created);
  });

  app.delete('/api/v1/monitored/:id', (req, res) => {
    const deleted = deleteMonitoredClaim(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Monitored claim not found' });
    }
    res.json({ success: true });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // In development, hook up Vite dev middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FreshCheck server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
