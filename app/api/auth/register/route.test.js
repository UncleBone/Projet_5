import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import supertest from 'supertest';

vi.mock("../../../../controller/auth.controller", () => {
  return {
    AuthController: class {
      register = vi.fn().mockResolvedValue({ 
        message: "User created successfully",
        userId: "12345" 
      });
    }
  };
});

import { POST } from './route';

/**
 * Fonction utilitaire pour convertir une requête Node.js (http) 
 * en requête Web API (Request) attendue par Next.js
 */
function requestToWebRequest(req, body) {
  const url = `http://localhost${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  return new Request(url, {
    method: req.method || 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('Test API route /api/auth/register POST handler', () => {
  let server;

  beforeAll(async () => {
    // Création d'un mini-serveur Node pour ponter vers le handler Next.js
    server = http.createServer(async (req, res) => {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', async () => {
        try {
          const webRequest = requestToWebRequest(req, body ? JSON.parse(body) : undefined);
          
          const response = await POST(webRequest);
          const json = await response.json();

          res.writeHead(response.status, Object.fromEntries(response.headers));
          res.end(JSON.stringify(json));
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

  it('should return 201 and success message when registration is successful', async () => {
    const api = supertest(server);
    
    const testData = { 
      username: 'newuser', 
      email: 'test@example.com',
      password: 'StrongPassword123!' 
    };

    const response = await api
      .post('/api/auth/register')
      .send(testData)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(201);
    
    expect(response.body).toHaveProperty('message', 'User created successfully');
    expect(response.body).toHaveProperty('userId', '12345');
  });
});