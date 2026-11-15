// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { createDb } from './db.js';

const ORIGIN = 'http://localhost:5173';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

let server;
let base;

beforeEach(async () => {
  const app = createApp({ db: createDb(), clientOrigin: ORIGIN, log: () => {} });
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
});

function post(path, body, headers = { 'Content-Type': 'application/json' }) {
  return fetch(`${base}${path}`, {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('GET /api/messages/:forum', () => {
  it.each(['nasa', 'esports-tribunal', 'notNasa'])(
    'returns seeded messages for %s',
    async (forum) => {
      const res = await fetch(`${base}/api/messages/${forum}`);
      expect(res.status).toBe(200);
      const messages = await res.json();
      expect(messages.length).toBeGreaterThan(0);
      expect(Object.keys(messages[0]).toSorted()).toEqual([
        'author',
        'id',
        'text',
        'timestamp',
      ]);
    },
  );

  it('returns 404 with a JSON error for an unknown forum', async () => {
    const res = await fetch(`${base}/api/messages/unknown`);
    expect(res.status).toBe(404);
    expect((await res.json()).error).toMatch(/unknown forum/i);
  });
});

describe('POST /api/messages/:forum', () => {
  it('creates a message with a uuid and only whitelisted fields', async () => {
    const res = await post('/api/messages/nasa', {
      author: '  Nguyen ',
      text: ' Hello ',
      isAdmin: true,
    });
    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.id).toMatch(UUID_PATTERN);
    expect(created.author).toBe('Nguyen');
    expect(created.text).toBe('Hello');
    expect(created.isAdmin).toBeUndefined();

    const list = await (await fetch(`${base}/api/messages/nasa`)).json();
    expect(list.at(-1).id).toBe(created.id);
  });

  it('rejects missing, blank or non-string fields with 400', async () => {
    for (const body of [
      {},
      { author: 'A' },
      { text: 'T' },
      { author: '  ', text: 'T' },
      { author: 'A', text: 42 },
    ]) {
      const res = await post('/api/messages/nasa', body);
      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/required/i);
    }
  });

  it('rejects oversized fields with 400', async () => {
    const res = await post('/api/messages/nasa', {
      author: 'A',
      text: 'x'.repeat(501),
    });
    expect(res.status).toBe(400);
  });

  it('rejects malformed JSON and empty bodies with 400 JSON errors', async () => {
    const malformed = await post('/api/messages/nasa', '{oops');
    expect(malformed.status).toBe(400);
    expect((await malformed.json()).error).toBeDefined();
    const empty = await fetch(`${base}/api/messages/nasa`, { method: 'POST' });
    expect(empty.status).toBe(400);
  });

  it('returns 404 when posting to an unknown forum', async () => {
    const res = await post('/api/messages/unknown', { author: 'A', text: 'T' });
    expect(res.status).toBe(404);
  });
});

describe('CORS', () => {
  it('only ever allows the configured client origin', async () => {
    const allowed = await fetch(`${base}/api/messages/nasa`, {
      headers: { Origin: ORIGIN },
    });
    expect(allowed.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    const other = await fetch(`${base}/api/messages/nasa`, {
      headers: { Origin: 'http://evil.example' },
    });
    expect(other.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    expect(other.headers.get('access-control-allow-origin')).not.toBe('*');
  });

  it('answers the preflight for JSON POST requests', async () => {
    const res = await fetch(`${base}/api/messages/nasa`, {
      method: 'OPTIONS',
      headers: {
        Origin: ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-methods')).toMatch(/POST/);
  });
});