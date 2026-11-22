import dns from 'node:dns';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { createModels } from './models.js';

// Some networks cannot resolve mongodb+srv records through the router.
if (process.env.DNS_SERVERS) {
  dns.setServers(
    process.env.DNS_SERVERS.split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}

const port = Number(process.env.APPEAL_PORT) || 4200;
const clientOrigin = process.env.CLIENT_ORIGIN;
if (!clientOrigin) {
  console.error('CLIENT_ORIGIN is not set');
  process.exit(1);
}

await mongoose.connect(uri, { dbName: 'appeal_portal' });
const app = createApp({ models: createModels(), clientOrigin });
app.listen(port, () => {
  console.log(`appeal-server listening on port ${port}`);
});