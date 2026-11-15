import { createApp } from './app.js';
import { createDb } from './db.js';

const { PORT = '3001', CLIENT_ORIGIN, API_DELAY_MS = '0' } = process.env;

if (!CLIENT_ORIGIN) {
  console.error('CLIENT_ORIGIN is required. Copy .env.example to .env first.');
  process.exit(1);
}

const app = createApp({
  db: createDb(),
  clientOrigin: CLIENT_ORIGIN,
  delayMs: Number(API_DELAY_MS),
});

app.listen(Number(PORT), () => {
  console.log(`Forum API listening on port ${PORT}`);
});