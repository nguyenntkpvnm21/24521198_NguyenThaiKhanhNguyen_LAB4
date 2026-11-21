import dns from 'node:dns';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { Profile, Swipe } from './models.js';
import { SEED_PROFILES } from './seedProfiles.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');

// Some networks refuse the SRV lookups made by Node's own resolver.
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(','));
}

await mongoose.connect(process.env.MONGODB_URI);

if ((await Profile.countDocuments()) === 0) {
  await Profile.insertMany(SEED_PROFILES);
  console.log(`Seeded ${SEED_PROFILES.length} profiles`);
}

const port = process.env.SWIPE_PORT ?? 4100;
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

createApp({ Profile, Swipe, clientOrigin }).listen(port, () => {
  console.log(`Swipe API listening on port ${port}`);
});