// @vitest-environment node
import http from 'node:http';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { createApp } from './app.js';

const ORIGIN = 'https://client.example';
const T0 = new Date('2026-03-01T00:00:00Z');
const HOUR = 3_600_000;

const validAppeal = {
  playerID: 'himass',
  fullName: 'Nguyen Van A',
  email: 'a@example.com',
  incidentDate: '2026-03-01',
  appealDate: '2026-03-05',
  reason: 'The penalty was applied to the wrong match record.',
};

let clock;
let models;
let server;
let base;

function createFakeModels() {
  const cases = new Map();
  const appeals = [];
  return {
    appeals,
    failNextCreate: false,
    reset() {
      cases.clear();
      appeals.length = 0;
      this.failNextCreate = false;
    },
    SlaCase: {
      async findOrCreate(playerID, now, windowMs) {
        if (!cases.has(playerID)) {
          cases.set(playerID, {
            playerID,
            openedAt: now,
            deadline: new Date(now.getTime() + windowMs),
          });
        }
        return cases.get(playerID);
      },
    },
    Appeal: {
      async create(data) {
        if (models.failNextCreate) throw new Error('db exploded');
        appeals.push(data);
        return { id: String(appeals.length), playerID: data.playerID, createdAt: clock };
      },
    },
  };
}

const getJson = (path) => fetch(`${base}${path}`);
const postJson = (body) =>
  fetch(`${base}/api/appeals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeAll(async () => {
  models = createFakeModels();
  const app = createApp({ models, clientOrigin: ORIGIN, now: () => clock });
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  clock = new Date(T0);
  models.reset();
});

describe('GET /api/dossiers/:playerID', () => {
  it('returns the dossier with a 72h deadline and the server time', async () => {
    const res = await getJson('/api/dossiers/himass');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dossier.id).toBe('himass');
    expect(body.sla.serverTime).toBe(T0.toISOString());
    expect(body.sla.deadline).toBe(new Date(T0.getTime() + 72 * HOUR).toISOString());
  });

  it('matches the id case-insensitively', async () => {
    const res = await getJson('/api/dossiers/TanVuu');
    expect(res.status).toBe(200);
    expect((await res.json()).dossier.id).toBe('tanvuu');
  });

  it('keeps the same deadline on later requests while server time moves on', async () => {
    const first = await (await getJson('/api/dossiers/himass')).json();
    clock = new Date(T0.getTime() + HOUR);
    const second = await (await getJson('/api/dossiers/himass')).json();
    expect(second.sla.deadline).toBe(first.sla.deadline);
    expect(second.sla.serverTime).toBe(new Date(T0.getTime() + HOUR).toISOString());
  });

  it('returns a JSON 404 for an unknown player', async () => {
    const res = await getJson('/api/dossiers/nobody');
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe('Dossier not found');
  });
});

describe('POST /api/appeals', () => {
  it('creates an appeal and returns 201', async () => {
    const res = await postJson(validAppeal);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe('1');
    expect(body.playerID).toBe('himass');
    expect(models.appeals).toHaveLength(1);
  });

  it('stores only whitelisted fields (no mass assignment)', async () => {
    const res = await postJson({ ...validAppeal, isAdmin: true, _id: 'x', createdAt: 'x' });
    expect(res.status).toBe(201);
    const stored = models.appeals[0];
    expect(stored.isAdmin).toBeUndefined();
    expect(stored._id).toBeUndefined();
    expect(stored.createdAt).toBeUndefined();
  });

  it('returns 400 with field errors for invalid input', async () => {
    const res = await postJson({ ...validAppeal, email: 'nope', reason: 'short' });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.fields.email).toBe('Enter a valid email address');
    expect(body.fields.reason).toBe('Reason must be at least 20 characters');
    expect(models.appeals).toHaveLength(0);
  });

  it('applies the cross-field date rule on the server too', async () => {
    const res = await postJson({
      ...validAppeal,
      incidentDate: '2026-03-10',
      appealDate: '2026-03-01',
    });
    expect(res.status).toBe(400);
    expect((await res.json()).fields.appealDate).toBe(
      'Appeal date cannot be before the incident date',
    );
  });

  it('returns 400, not 500, when a field has the wrong type', async () => {
    const res = await postJson({ ...validAppeal, fullName: 123 });
    expect(res.status).toBe(400);
    expect((await res.json()).fields.fullName).toBeDefined();
  });

  it('returns 400 for a malformed JSON body', async () => {
    const res = await fetch(`${base}/api/appeals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ not json',
    });
    expect(res.status).toBe(400);
  });

  it('returns 404 for an unknown player', async () => {
    const res = await postJson({ ...validAppeal, playerID: 'nobody' });
    expect(res.status).toBe(404);
  });

  it('rejects appeals after the deadline with 403', async () => {
    await getJson('/api/dossiers/himass');
    clock = new Date(T0.getTime() + 73 * HOUR);
    const res = await postJson(validAppeal);
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('The appeal window has closed');
    expect(models.appeals).toHaveLength(0);
  });

  it('hides internal errors behind a generic 500', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    models.failNextCreate = true;
    const res = await postJson(validAppeal);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Internal server error');
    expect(JSON.stringify(body)).not.toContain('exploded');
    spy.mockRestore();
  });
});

describe('CORS and unknown routes', () => {
  it('answers preflight with 204 and the configured origin', async () => {
    const res = await fetch(`${base}/api/appeals`, { method: 'OPTIONS' });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('adds the CORS header to normal responses', async () => {
    const res = await getJson('/api/dossiers/himass');
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('returns a JSON 404 for unknown API paths', async () => {
    const res = await getJson('/api/nothing');
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe('Not found');
  });
});