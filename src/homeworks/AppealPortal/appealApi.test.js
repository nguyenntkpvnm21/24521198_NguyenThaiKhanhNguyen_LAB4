import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchDossier, postAppeal, ApiError } from './appealApi.js';

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchDossier', () => {
  it('requests the dossier endpoint and returns the parsed body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { dossier: { id: 'himass' } }));
    vi.stubGlobal('fetch', fetchMock);
    const body = await fetchDossier('himass');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/dossiers\/himass$/);
    expect(body.dossier.id).toBe('himass');
  });

  it('encodes the player id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {}));
    vi.stubGlobal('fetch', fetchMock);
    await fetchDossier('a/b');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/dossiers\/a%2Fb$/);
  });

  it('passes the abort signal to fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {}));
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    await fetchDossier('himass', { signal: controller.signal });
    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
  });

  it('throws an ApiError carrying the status and server message when not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(404, { error: 'Dossier not found' })));
    const error = await fetchDossier('nobody').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe('Dossier not found');
  });

  it('still throws an ApiError when the error body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      }),
    );
    const error = await fetchDossier('himass').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
  });
});

describe('postAppeal', () => {
  it('posts JSON to the appeals endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { id: '1' }));
    vi.stubGlobal('fetch', fetchMock);
    const payload = { playerID: 'himass', reason: 'text' };
    const body = await postAppeal(payload);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/appeals$/);
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual(payload);
    expect(body.id).toBe('1');
  });

  it('exposes field errors from a 400 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(400, { error: 'Validation failed', fields: { email: 'Enter a valid email address' } }),
      ),
    );
    const error = await postAppeal({}).catch((e) => e);
    expect(error.status).toBe(400);
    expect(error.fields.email).toBe('Enter a valid email address');
  });
});