// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';

const ID_A = 'a'.repeat(24);
const ID_B = 'b'.repeat(24);
const ORIGIN = 'http://localhost:5173';

function createFakeModels() {
  const profiles = [
    { _id: ID_A, name: 'Linh', age: 24, bio: 'First profile.' },
    { _id: ID_B, name: 'Minh', age: 26, bio: 'Second profile.' },
  ];
  const swipes = [];

  const Profile = {
    find: () => ({ lean: async () => profiles }),
    exists: async ({ _id }) =>
      profiles.some((profile) => profile._id === _id) ? { _id } : null,
  };

  const Swipe = {
    find: () => ({ sort: () => ({ lean: async () => swipes }) }),
    create: async (data) => {
      if (swipes.some((swipe) => swipe.profileId === data.profileId)) {
        const error = new Error('E11000 duplicate key error');
        error.code = 11000;
        throw error;
      }
      const record = {
        _id: String(swipes.length + 1).padStart(24, '0'),
        ...data,
        createdAt: new Date(),
      };
      swipes.push(record);
      return { toObject: () => ({ ...record }) };
    },
    deleteOne: async ({ profileId }) => {
      const index = swipes.findIndex((swipe) => swipe.profileId === profileId);
      if (index >= 0) swipes.splice(index, 1);
      return { deletedCount: index >= 0 ? 1 : 0 };
    },
  };

  return { Profile, Swipe, swipes };
}

let server;
let baseUrl;
let models;

beforeEach(async () => {
  models = createFakeModels();
  const app = createApp({
    Profile: models.Profile,
    Swipe: models.Swipe,
    clientOrigin: ORIGIN,
  });
  server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(
  () =>
    new Promise((resolve) => {
      server.closeAllConnections?.();
      server.close(resolve);
    }),
);

const postSwipe = (body) =>
  fetch(`${baseUrl}/api/swipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('GET /api/profiles', () => {
  it('returns profiles with a string id and no _id', async () => {
    const response = await fetch(`${baseUrl}/api/profiles`);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].id).toBe(ID_A);
    expect(body[0]._id).toBeUndefined();
  });
});

describe('POST /api/swipe', () => {
  it('creates a swipe and returns 201', async () => {
    const response = await postSwipe({ profileId: ID_A, type: 'LIKE' });
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.profileId).toBe(ID_A);
    expect(body.type).toBe('LIKE');
    expect(body.id).toBeDefined();
  });

  it('ignores fields the client is not allowed to set (mass assignment)', async () => {
    const response = await postSwipe({
      profileId: ID_A,
      type: 'LIKE',
      score: 9999,
      _id: 'x',
    });
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.score).toBeUndefined();
    expect(models.swipes[0].score).toBeUndefined();
    expect(models.swipes[0]._id).not.toBe('x');
  });

  it('rejects an unknown action type with 400', async () => {
    const response = await postSwipe({ profileId: ID_A, type: 'DISLIKE' });
    expect(response.status).toBe(400);
  });

  it('rejects a request without a body with 400', async () => {
    const response = await fetch(`${baseUrl}/api/swipe`, { method: 'POST' });
    expect(response.status).toBe(400);
  });

  it('rejects malformed JSON with 400', async () => {
    const response = await fetch(`${baseUrl}/api/swipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{bad json',
    });
    expect(response.status).toBe(400);
  });

  it('returns 404 for an unknown profile', async () => {
    const response = await postSwipe({ profileId: 'c'.repeat(24), type: 'LIKE' });
    expect(response.status).toBe(404);
  });

  it('returns 409 when the profile was already swiped', async () => {
    await postSwipe({ profileId: ID_A, type: 'LIKE' });
    const response = await postSwipe({ profileId: ID_A, type: 'PASS' });
    expect(response.status).toBe(409);
  });
});

describe('GET /api/swipes', () => {
  it('returns an empty list at first', async () => {
    const response = await fetch(`${baseUrl}/api/swipes`);
    expect(await response.json()).toEqual([]);
  });

  it('returns swipes in the order they were made', async () => {
    await postSwipe({ profileId: ID_B, type: 'PASS' });
    await postSwipe({ profileId: ID_A, type: 'LIKE' });
    const response = await fetch(`${baseUrl}/api/swipes`);
    const body = await response.json();
    expect(body.map((swipe) => swipe.profileId)).toEqual([ID_B, ID_A]);
  });
});

describe('DELETE /api/swipe/:profileId', () => {
  it('removes the swipe and returns 204', async () => {
    await postSwipe({ profileId: ID_A, type: 'LIKE' });
    const response = await fetch(`${baseUrl}/api/swipe/${ID_A}`, {
      method: 'DELETE',
    });
    expect(response.status).toBe(204);
    expect(models.swipes).toHaveLength(0);
  });

  it('returns 404 when there is nothing to remove', async () => {
    const response = await fetch(`${baseUrl}/api/swipe/${ID_A}`, {
      method: 'DELETE',
    });
    expect(response.status).toBe(404);
  });

  it('returns 400 for an invalid id', async () => {
    const response = await fetch(`${baseUrl}/api/swipe/not-an-id`, {
      method: 'DELETE',
    });
    expect(response.status).toBe(400);
  });
});

describe('CORS', () => {
  it('answers the preflight request for the configured client origin', async () => {
    const response = await fetch(`${baseUrl}/api/swipe`, { method: 'OPTIONS' });
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });
});