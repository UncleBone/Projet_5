import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import supertest from 'supertest';

// 1. Mocks des dépendances
const mockGetAll = vi.fn();

vi.mock("../../../controller/topic.controller", () => {
  return {
    TopicController: class {
      getAll = () => mockGetAll();
    }
  };
});

vi.mock("../../../lib/authenticate", () => ({
  authenticate: vi.fn()
}));

// Import du handler (après les mocks)
import { GET } from './route';
import { authenticate } from '../../../lib/authenticate';

/**
 * Utilitaire pour transformer la requête Node (http.IncomingMessage) 
 * en Request (Web API) pour le handler Next.js
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

describe('Test API route /api/topics GET handler', () => {
  let server;

  beforeAll(async () => {
    // Création d'un serveur HTTP pour faire le pont entre Supertest et le handler Next.js
    server = http.createServer(async (req, res) => {
      try {
        const webRequest = requestToWebRequest(req);
        
        // Appel du handler GET (qui est wrappé par withErrorHandling)
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

  it('devrait retourner 401 si le token est invalide', async () => {
    // Simulation d'un échec d'auth
    authenticate.mockReturnValue(null);

    const api = supertest(server);
    const response = await api.get('/api/topics');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token invalide');
    expect(mockGetAll).not.toHaveBeenCalled();
  });

  it('devrait retourner 200 et la liste des topics si authentifié', async () => {
    // Simulation d'une auth réussie
    authenticate.mockReturnValue({ id: 'user_123' });
    
    const fakeTopics = [
      { id: 1, title: 'JavaScript' },
      { id: 2, title: 'Vitest' }
    ];
    mockGetAll.mockResolvedValue(fakeTopics);

    const api = supertest(server);
    const response = await api.get('/api/topics');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeTopics);
    expect(mockGetAll).toHaveBeenCalledTimes(1);
  });

  it('devrait retourner 500 si le contrôleur crash', async () => {
    authenticate.mockReturnValue({ id: 'user_123' });
    
    // On simule une erreur fatale dans la base de données
    mockGetAll.mockRejectedValue(new Error('Erreur DB'));

    const api = supertest(server);
    const response = await api.get('/api/topics');

    // withErrorHandling devrait attraper l'erreur
    expect(response.status).toBe(500);
  });
});