import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import supertest from 'supertest';

// 1. Mocks des méthodes du contrôleur
const mockAddSubscription = vi.fn();
const mockRemoveSubscription = vi.fn();

vi.mock("../../../../../controller/user.controller", () => {
  return {
    UserController: class {
      addSubscription = (userId, topicId) => mockAddSubscription(userId, topicId);
      removeSubscription = (userId, topicId) => mockRemoveSubscription(userId, topicId);
    }
  };
});

vi.mock("../../../../../lib/authenticate", () => ({
  authenticate: vi.fn()
}));

// Import des handlers (après les mocks)
import { POST, DELETE } from './route';
import { authenticate } from '../../../../../lib/authenticate';

/**
 * Utilitaire pour transformer la requête Node en Request Web API
 */
function requestToWebRequest(req) {
  const url = `http://localhost${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  return new Request(url, {
    method: req.method,
    headers,
  });
}

describe('Test API route /api/user/subscriptions/[id] (POST & DELETE)', () => {
  let server;

  beforeAll(async () => {
    server = http.createServer(async (req, res) => {
      try {
        const webRequest = requestToWebRequest(req);
        
        // Extraction de l'ID depuis l'URL (ex: /api/user/subscriptions/42 -> 42)
        const urlParts = req.url.split('/');
        const id = urlParts[urlParts.length - 1];

        // Simulation du contexte Next.js (params est une Promise dans les versions récentes)
        const context = {
          params: Promise.resolve({ id })
        };

        let response;
        if (req.method === 'POST') {
          response = await POST(webRequest, context);
        } else if (req.method === 'DELETE') {
          response = await DELETE(webRequest, context);
        }

        const status = response.status;
        const contentType = response.headers.get('content-type');
        
        let body = null;
        if (contentType && contentType.includes('application/json')) {
          body = await response.json();
        }

        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(body ? JSON.stringify(body) : '');
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ message: 'Erreur serveur' }));
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

  describe('POST /api/user/subscriptions/[id]', () => {
    it('devrait retourner 401 si le token est invalide', async () => {
      authenticate.mockReturnValue(null);

      const response = await supertest(server).post('/api/user/subscriptions/10');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token invalide');
    });

    it('devrait retourner 201 après avoir ajouté un abonnement', async () => {
      authenticate.mockReturnValue({ id: 'user_123' });
      mockAddSubscription.mockResolvedValue(true);

      const response = await supertest(server).post('/api/user/subscriptions/10');

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('abonnement rajouté');
      // On vérifie que l'ID a été converti en Number (Number(id))
      expect(mockAddSubscription).toHaveBeenCalledWith('user_123', 10);
    });

    it('devrait retourner 500 en cas d\'erreur serveur', async () => {
      authenticate.mockReturnValue({ id: 'user_123' });
      mockAddSubscription.mockRejectedValue(new Error('DB Error'));

      const response = await supertest(server).post('/api/user/subscriptions/10');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Erreur serveur');
    });
  });

  describe('DELETE /api/user/subscriptions/[id]', () => {
    it('devrait retourner 401 si le token est invalide', async () => {
      authenticate.mockReturnValue(null);

      const response = await supertest(server).delete('/api/user/subscriptions/10');

      expect(response.status).toBe(401);
    });

    it('devrait retourner 200 après avoir supprimé un abonnement', async () => {
      authenticate.mockReturnValue({ id: 'user_123' });
      mockRemoveSubscription.mockResolvedValue(true);

      const response = await supertest(server).delete('/api/user/subscriptions/10');

      expect(response.status).toBe(200);
      expect(mockRemoveSubscription).toHaveBeenCalledWith('user_123', 10);
    });

    it('devrait retourner 500 en cas d\'erreur serveur', async () => {
      authenticate.mockReturnValue({ id: 'user_123' });
      mockRemoveSubscription.mockRejectedValue(new Error('DB Error'));

      const response = await supertest(server).delete('/api/user/subscriptions/10');

      expect(response.status).toBe(500);
    });
  });
});