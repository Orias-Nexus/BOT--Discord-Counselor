import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import serverRoutes from './routes/serverRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import functionRoutes from './routes/functionRoutes.js';
import levelRoutes from './routes/levelRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? '*' }));
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, '../../assets')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

app.get('/api/info', (_req, res) => {
  res.json({
    name: 'Discord Counselor API',
    version: '1.0.0',
    endpoints: ['/health', '/api/info', '/api/servers', '/api/servers/:serverId/channels', '/api/members', '/api/functions', '/api/levels'],
  });
});

app.use('/api/servers', serverRoutes);
app.use('/api/servers/:serverId/channels', channelRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/functions', functionRoutes);
app.use('/api/levels', levelRoutes);

app.listen(PORT, () => {
  console.log(`Backend API running at http://localhost:${PORT}`);
});
