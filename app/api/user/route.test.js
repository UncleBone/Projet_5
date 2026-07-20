import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import supertest from 'supertest';

// 1. Mocks des méthodes du contrôleur
const mockGetUserInfo = vi.fn();
const mockUpdate = vi.fn();

vi.mock("../../../controller/user.controller", () => {
  return {
    UserController: class {
      getUserInfo = (id) => mockGetUserInfo(id);
      update = (id, data) => mockUpdate(id, data);
    }
  };
});

vi.mock("../../../lib/authenticate", () => ({
  authenticate: vi.fn()
}));

// Import des handlers (après les mocks)
import { GET, PUT } from './route';
import { authenticate } from '../../../lib/authenticate';

/**
 * Utilitaire pour transformer la requête Node en Request Web API
 * Gère le body pour la méthode PUT
 */
async function requestToWebRequest(req) {
  const url = `http://localhost${req.url}`;
  
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  return new Request(url, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? body : null,
  });
}

describe('Test API route /api/user (GET & PUT)', () => {
  let server;

  beforeAll(async () => {
    server = http.createServer(async (req, res) => {
      try {
        const webRequest = await requestToWebRequest(req);
        let response;

        // Dispatcher selon la méthode HTTP
        if (req.method === 'GET') {
          response = await GET(webRequest);
        } else if (req.method === 'PUT') {
          response = await PUT(webRequest);
        }

        const status = response.status;
        const json = await response.json();

        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(json));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ message: err.message }));
      }
    });

    await new Promise((resolve) => server.listen(0, resolve));
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/user', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      authenticate.mockReturnValue(null);

      const response = await supertest(server).get('/api/user');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token invalide');
    });

    it('devrait retourner 200 et les infos de l\'utilisateur', async () => {
      const mockUser = { id: 'user_123', email: 'test@test.com', name: 'John Doe' };
      authenticate.mockReturnValue({ id: 'user_123' });
      mockGetUserInfo.mockResolvedValue(mockUser);

      const response = await supertest(server).get('/api/user');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(mockGetUserInfo).toHaveBeenCalledWith('user_123');
    });
  });

  describe('PUT /api/user', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      authenticate.mockReturnValue(null);

      const response = await supertest(server)
        .put('/api/user')
        .send({ name: 'New Name' });

      expect(response.status).toBe(401);
    });

    it('devrait retourner 200 et le résultat de la mise à jour', async () => {
      const updateData = { name: 'Updated Name' };
      const updateResult = { id: 'user_123', name: 'Updated Name', success: true };
      
      authenticate.mockReturnValue({ id: 'user_123' });
      mockUpdate.mockResolvedValue(updateResult);

      const response = await supertest(server)
        .put('/api/user')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updateResult);
      expect(mockUpdate).toHaveBeenCalledWith('user_123', updateData);
    });

    it('devrait retourner 500 si le contrôleur échoue', async () => {
      authenticate.mockReturnValue({ id: 'user_123' });
      mockUpdate.mockRejectedValue(new Error('Update failed'));

      const response = await supertest(server)
        .put('/api/user')
        .send({ name: 'Fail' });

      expect(response.status).toBe(500);
    });
  });
});