import { describe, it, expect, vi } from 'vitest';
import { authenticate } from './authenticate';
import * as jwtModule from './jwt';

vi.mock('./jwt', () => ({
  verifyToken: vi.fn(),
}));

describe('authenticate', () => {
  const mockVerifyToken = jwtModule.verifyToken;

  function createRequestWithAuth(authHeader) {
    return new Request('http://localhost/api', {
      headers: authHeader ? { authorization: authHeader } : {},
    });
  }

  it('doit lancer une erreur si l\'entête Authorization est manquant', () => {
    const req = createRequestWithAuth();
    expect(() => authenticate(req)).toThrow('Token manquant');
  });

  it('doit lancer une erreur si l\'entête Authorization ne commence pas par Bearer', () => {
    const req = createRequestWithAuth('Basic abcdef');
    expect(() => authenticate(req)).toThrow('Token manquant');
  });

  it('doit lancer une erreur si le token est invalide', () => {
    mockVerifyToken.mockReturnValue(null); // token invalide
    const req = createRequestWithAuth('Bearer invalidtoken');
    expect(() => authenticate(req)).toThrow('Token invalide');
  });

  it('doit retourner le résultat décodé si le token est valide', () => {
    const decodedPayload = { userId: 123, name: 'Test User' };
    mockVerifyToken.mockReturnValue(decodedPayload);
    const req = createRequestWithAuth('Bearer validtoken');
    const result = authenticate(req);
    expect(result).toEqual(decodedPayload);
  });
});