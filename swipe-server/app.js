import express from 'express';
import { OBJECT_ID_PATTERN, validateSwipe } from './validateSwipe.js';

const toPublic = ({ _id, ...rest }) => ({ id: String(_id), ...rest });

export function createApp({ Profile, Swipe, clientOrigin }) {
  const app = express();

  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', clientOrigin);
    res.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });
  app.use(express.json());

  app.get('/api/profiles', async (req, res) => {
    const profiles = await Profile.find().lean();
    res.json(profiles.map(toPublic));
  });

  app.get('/api/swipes', async (req, res) => {
    const swipes = await Swipe.find().sort({ createdAt: 1 }).lean();
    res.json(swipes.map(toPublic));
  });

  app.post('/api/swipe', async (req, res) => {
    const { value, error } = validateSwipe(req.body);
    if (error) return res.status(400).json({ error });

    const profile = await Profile.exists({ _id: value.profileId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    try {
      const record = await Swipe.create(value);
      return res.status(201).json(toPublic(record.toObject()));
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: 'Profile was already swiped' });
      }
      throw err;
    }
  });

  app.delete('/api/swipe/:profileId', async (req, res) => {
    const { profileId } = req.params;
    if (!OBJECT_ID_PATTERN.test(profileId)) {
      return res.status(400).json({ error: 'Invalid profile id' });
    }
    const { deletedCount } = await Swipe.deleteOne({ profileId });
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Swipe not found' });
    }
    return res.sendStatus(204);
  });

  // Express 5 forwards rejected async handlers here.
  app.use((err, _req, res, _next) => {
    const status = err.status ?? 500;
    res.status(status).json({
      error: status < 500 ? err.message : 'Internal server error',
    });
  });

  return app;
}