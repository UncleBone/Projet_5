import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import supertest from 'supertest';

// 1. Mocks
const mockAddComment = vi.fn();

vi.mock("../../../../../controller/post.controller", () => {
  return {
    PostController: class {
      addComment = (...args) => mockAddComment(...args);
    }
  };
});

vi.mock("../../../../../lib/authenticate", () => ({
  authenticate: vi.fn()
}));

// On importe les handlers et mocks après les mocks vi
import { POST } from './route';
import { authenticate } from '../../../../../lib/authenticate';

/**
 * Utilitaire pour transformer la requête Node en Request Web API
 * Gère également le body pour les requêtes POST
 */
async function requestToWebRequest(req) {
  const url = `http://localhost${req.url}`;
  
  // Lecture du body Node.js
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

describe('Test API route /api/posts/[id]/comment POST handler', () => {
  let server;

  beforeAll(async () => {
    server = http.createServer(async (req, res) => {
      try {
        const webRequest = await requestToWebRequest(req);
        
        // Extraction de l'ID depuis l'URL (ex: /api/posts/123/comment -> 123)
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 2]; // L'ID est l'avant-dernier segment

        // Simulation de l'objet context de Next.js
        const context = {
          params: Promise.resolve({ id })
        };

        // Note: Dans ton code route.ts, POST est wrappé par withErrorHandling
        // Il prend req en premier argument.
        const response = await POST(webRequest, context);
        
        const status = response.status;
        const contentType = response.headers.get('content-type');
        
        let body;
        if (contentType?.includes('application/json')) {
            body = await response.json();
        } else {
            body = await response.text();
        }

        res.writeHead(status, Object.fromEntries(response.headers));
        res.end(body ? JSON.stringify(body) : '');
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ message: err.message }));
      }
    });

    await new Promise((resolve) => server.listen(0, () => resolve()));
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('devrait retourner 401 si le token est invalide', async () => {
    authenticate.mockReturnValue(null);

    const api = supertest(server);
    const response = await api
      .post('/api/posts/1/comment')
      .send({ content: 'Super post !' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token invalide');
  });

  it('devrait retourner 201 et appeler le contrôleur si tout est correct', async () => {
    const mockUser = { id: 'user123' };
    const commentData = { content: 'Mon super commentaire' };
    
    authenticate.mockReturnValue(mockUser);
    mockAddComment.mockResolvedValue(true);

    const api = supertest(server);
    const response = await api
      .post('/api/posts/1/comment')
      .send(commentData);

    expect(response.status).toBe(201);
    // Vérifie que addComment a été appelé avec l'ID du user et les données du commentaire
    expect(mockAddComment).toHaveBeenCalledWith(mockUser.id, commentData);
  });

  it('devrait retourner 500 si le contrôleur ou le JSON parsing échoue', async () => {
    authenticate.mockReturnValue({ id: 'user1' });
    // On simule une erreur dans le contrôleur
    mockAddComment.mockRejectedValue(new Error('Erreur base de données'));

    const api = supertest(server);
    const response = await api
      .post('/api/posts/1/comment')
      .send({ content: 'Test' });

    // withErrorHandling devrait attraper l'erreur et renvoyer une 500
    expect(response.status).toBe(500);
  });
});