import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authClientService } from './auth.client.service';

describe('authClientService', () => {
  let store;

  beforeEach(() => {
    store = {};

    global.localStorage = {
      getItem: (key) => (key in store ? store[key] : null),
      setItem: (key, value) => {
        store[key] = value;
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      length: 0,
      key: vi.fn(),
    };
  });

  it('login : stocke token et user dans localStorage', () => {
    const user = { token: 'tokentest' };
    authClientService.login(user);

    expect(global.localStorage.getItem('token')).toBe('tokentest');
    expect(global.localStorage.getItem('user')).toBe(JSON.stringify(user));
  });

  it('logout : supprime token et user de localStorage', () => {
    global.localStorage.setItem('token', 'testtoken');
    global.localStorage.setItem('user', JSON.stringify({ token: 'testtoken' }));

    authClientService.logout();

    expect(global.localStorage.getItem('token')).toBeNull();
    expect(global.localStorage.getItem('user')).toBeNull();
  });

  it('getCurrentUser : retourne l\'objet user parsé s\'il existe', () => {
    const user = { token: 'token123' };
    global.localStorage.setItem('user', JSON.stringify(user));

    const currentUser = authClientService.getCurrentUser();

    expect(currentUser).toEqual(user);
  });

  it('getCurrentUser : retourne null si pas de user', () => {
    global.localStorage.removeItem('user');
    const currentUser = authClientService.getCurrentUser();

    expect(currentUser).toBeNull();
  });

  it('getToken : retourne le token stocké', () => {
    global.localStorage.setItem('token', 'tokentest');

    expect(authClientService.getToken()).toBe('tokentest');
  });

  it('getToken : retourne null si pas de token', () => {
    global.localStorage.removeItem('token');

    expect(authClientService.getToken()).toBeNull();
  });

  it('isAuthenticated : retourne true si token présent', () => {
    global.localStorage.setItem('token', 'tokentest');

    expect(authClientService.isAuthenticated()).toBe(true);
  });

  it('isAuthenticated : retourne false si pas de token', () => {
    global.localStorage.removeItem('token');

    expect(authClientService.isAuthenticated()).toBe(false);
  });
});