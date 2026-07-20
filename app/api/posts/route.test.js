import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import supertest from 'supertest';

// 1. Mock du contrôleur
vi.mock("../../../controller/post.controller", () => {
  return {
    PostController: class {
      getAll = vi.fn().mockResolvedValue([{ id: 1, title: 'Post Test', content: 'Contenu' }]);
      create = vi.fn().mockResolvedValue({ id: 2 });
    }
  };
});

// 2. Mock de la fonction d'authentification
vi.mock("../../../lib/authenticate", () => ({
  authenticate: vi.fn()
}));

// Import des handlers et de la fonction de mock d'auth
import { GET, POST } from './route';
import { authenticate } from '../../../lib/authenticate';

/**
 * Utilitaire pour transformer la requête Node en Request Web API
 */
function requestToWebRequest(req, body) {
  const url = `http://localhost${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  return new Request(url, {
    method: req.method,
    headers,
    body: (req.method !== 'GET' && req.method !== 'HEAD' && body) ? JSON.stringify(body) : undefined,
  });
}

describe('Test API route /api/posts', () => {
  let server;

  beforeAll(async () => {
    server = http.createServer(async (req, res) => {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', async () => {
        try {
          const webRequest = requestToWebRequest(req, body ? JSON.parse(body) : undefined);
          
          // Routage manuel vers le bon handler selon la méthode
          let response;
          if (req.method === 'GET') {
            response = await GET(webRequest);
          } else if (req.method === 'POST') {
            response = await POST(webRequest);
          }

          const responseData = await response.text();
          res.writeHead(response.status, Object.fromEntries(response.headers));
          res.end(responseData);
        } catch (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ message: err.message }));
        }
      });
    });

    await new Promise((resolve) => server.listen(0, resolve));
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  describe('GET /api/posts', () => {
    it('devrait retourner 401 si l\'utilisateur n\'est pas authentifié', async () => {
      authenticate.mockReturnValue(null); // Simule échec auth

      const api = supertest(server);
      const response = await api.get('/api/posts');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Authentification requise');
    });

    it('devrait retourner 200 et la liste des posts si authentifié', async () => {
      authenticate.mockReturnValue({ id: 'user123', email: 'test@test.com' }); // Simule succès auth

      const api = supertest(server);
      const response = await api.get('/api/posts');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('title', 'Post Test');
    });
  });

  describe('POST /api/posts', () => {
    it('devrait retourner 201 après la création d\'un post', async () => {
      authenticate.mockReturnValue({ id: 'user123' });

      const api = supertest(server);
      const newPost = { title: 'Nouveau Post', content: 'Mon contenu' };
      
      const response = await api
        .post('/api/posts')
        .send(newPost);

      expect(response.status).toBe(201);
      // Votre route.ts renvoie NextResponse.json(null, {status: 201})
      expect(response.body).toBe(null); 
    });

    it('devrait retourner 401 pour un POST non authentifié', async () => {
      authenticate.mockReturnValue(null);

      const api = supertest(server);
      const response = await api.post('/api/posts').send({});

      expect(response.status).toBe(401);
    });
  });
});