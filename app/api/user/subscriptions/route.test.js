import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import supertest from 'supertest';

// 1. Mocks des dépendances
const mockGetUserSubscriptions = vi.fn();

vi.mock("../../../../controller/user.controller", () => {
  return {
    UserController: class {
      getUserSubscriptions = (id) => mockGetUserSubscriptions(id);
    }
  };
});

vi.mock("../../../../lib/authenticate", () => ({
  authenticate: vi.fn()
}));

// Import du handler (après les mocks)
import { GET } from './route';
import { authenticate } from '../../../../lib/authenticate';

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

describe('Test API route /api/user/subscriptions GET handler', () => {
  let server;

  beforeAll(async () => {
    server = http.createServer(async (req, res) => {
      try {
        const webRequest = requestToWebRequest(req);
        
        // Appel du handler GET (wrappe par avecErrorHandling)
        const response = await GET(webRequest);
        
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

  it('devrait retourner 401 si le token est invalide', async () => {
    authenticate.mockReturnValue(null);

    const api = supertest(server);
    const response = await api.get('/api/user/subscriptions');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token invalide');
    expect(mockGetUserSubscriptions).not.toHaveBeenCalled();
  });

  it('devrait retourner 200 et la liste des abonnements de l\'utilisateur', async () => {
    const userId = 'user_abc_123';
    const fakeSubscriptions = [
      { id: 1, topicName: 'Technologie', active: true },
      { id: 2, topicName: 'Cuisine', active: true }
    ];

    // Simulation auth réussie
    authenticate.mockReturnValue({ id: userId });
    // Simulation retour contrôleur
    mockGetUserSubscriptions.mockResolvedValue(fakeSubscriptions);

    const api = supertest(server);
    const response = await api.get('/api/user/subscriptions');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeSubscriptions);
    // Vérifie que le contrôleur a bien reçu l'ID provenant du token
    expect(mockGetUserSubscriptions).toHaveBeenCalledWith(userId);
  });

  it('devrait retourner 500 en cas d\'erreur du contrôleur', async () => {
    authenticate.mockReturnValue({ id: 'user_123' });
    mockGetUserSubscriptions.mockRejectedValue(new Error('Erreur interne base de données'));

    const api = supertest(server);
    const response = await api.get('/api/user/subscriptions');

    // withErrorHandling attrape l'erreur et renvoie 500
    expect(response.status).toBe(500);
  });
});