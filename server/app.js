import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';

const MAX_AUTHOR_LENGTH = 40;
const MAX_TEXT_LENGTH = 500;

export function createApp({ db, clientOrigin, delayMs = 0, log = console.error }) {
  const app = express();

  app.use(cors({ origin: clientOrigin }));
  app.use(express.json({ limit: '10kb' }));

  app.use((req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
      }
    });
    next();
  });

  if (delayMs > 0) {
    app.use((req, res, next) => {
      setTimeout(next, delayMs);
    });
  }

  app.get('/api/messages/:forum', (req, res) => {
    const { forum } = req.params;
    if (!db.hasForum(forum)) {
      return res.status(404).json({ error: `Unknown forum: ${forum}` });
    }
    return res.json(db.getMessagesByForum(forum));
  });

  app.post('/api/messages/:forum', (req, res) => {
    const { forum } = req.params;
    if (!db.hasForum(forum)) {
      return res.status(404).json({ error: `Unknown forum: ${forum}` });
    }

    const { author, text } = req.body ?? {};
    const isValidString = (value) => typeof value === 'string' && value.trim() !== '';
    if (!isValidString(author) || !isValidString(text)) {
      return res.status(400).json({ error: 'Missing required fields: author and text' });
    }
    if (author.trim().length > MAX_AUTHOR_LENGTH || text.trim().length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ error: 'Field too long' });
    }

    const newMessage = {
      id: randomUUID(),
      author: author.trim(),
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    db.addMessage(forum, newMessage);
    return res.status(201).json(newMessage);
  });

  app.use((err, req, res, next) => {
    const status = err.status >= 400 && err.status < 500 ? err.status : 500;
    log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} -> ${status} ${err.message}`);
    res.status(status).json({
      error: status === 500 ? 'Internal server error' : 'Invalid request body',
    });
  });

  return app;
}