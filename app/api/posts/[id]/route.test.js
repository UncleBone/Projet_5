import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import supertest from 'supertest';

const mockGetById = vi.fn();

// 1. Mocks
vi.mock("../../../../controller/post.controller", () => {
  return {
    PostController: class {
      getById = (id) => mockGetById(id);
    }
  };
});

vi.mock("../../../../lib/authenticate", () => ({
  authenticate: vi.fn()
}));

// Import des handlers et mocks
import { GET } from './route';
import { authenticate } from '../../../../lib/authenticate';
import { PostController } from '../../../../controller/post.controller';

const mockController = new PostController();

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

describe('Test API route /api/posts/[id] GET handler', () => {
  let server;

  beforeAll(async () => {
    server = http.createServer(async (req, res) => {
      try {
        const webRequest = requestToWebRequest(req);
        
        // Extraction de l'ID depuis l'URL (ex: /api/posts/123 -> 123)
        const urlParts = req.url.split('/');
        const id = urlParts[urlParts.length - 1];

        // Simulation de l'objet context de Next.js (avec params asynchrone)
        const context = {
          params: Promise.resolve({ id })
        };

        const response = await GET(webRequest, context);
        const json = await response.json();

        res.writeHead(response.status, Object.fromEntries(response.headers));
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
    authenticate.mockReturnValue(null);

    const api = supertest(server);
    const response = await api.get('/api/posts/1');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token invalide');
  });

  it('devrait retourner 404 si le post n\'existe pas', async () => {
    authenticate.mockReturnValue({ id: 'user1' });
    // On simule que le contrôleur ne trouve rien
    mockGetById.mockResolvedValue(null);

    const api = supertest(server);
    const response = await api.get('/api/posts/999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Post non trouvé');
  });

  it('devrait retourner 200 et le post si tout est correct', async () => {
    authenticate.mockReturnValue({ id: 'user1' });
    const fakePost = { id: 1, title: 'Post trouvé', content: 'Contenu' };
    // mockController.getById.mockResolvedValue(fakePost);
    mockGetById.mockResolvedValue(fakePost);

    const api = supertest(server);
    const response = await api.get('/api/posts/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakePost);
    // Vérifie que le contrôleur a été appelé avec le bon ID (converti en nombre)
    // expect(mockController.getById).toHaveBeenCalledWith(1);
    expect(mockGetById).toHaveBeenCalledWith(1);
  });

  it('devrait retourner 500 en cas d\'erreur interne', async () => {
    authenticate.mockReturnValue({ id: 'user1' });
    mockGetById.mockRejectedValue(new Error('DB Error'));

    const api = supertest(server);
    const response = await api.get('/api/posts/1');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Erreur serveur');
  });
});