import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import Login from './page';
import { authClientService } from '../../service/auth.client.service';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../../service/auth.client.service', () => ({
  authClientService: {
    login: vi.fn(),
  },
}));

describe('Login component', () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useRouter.mockReturnValue({
      push: pushMock,
    });

    global.fetch = vi.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('doit afficher le formulaire avec les champs et le bouton', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: 'Se connecter' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email ou nom d'utilisateur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeEnabled();
  });

  it('doit permettre de saisir login et password', () => {
    render(<Login />);

    const loginInput = screen.getByLabelText(/Email ou nom d'utilisateur/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);

    fireEvent.change(loginInput, { target: { value: 'user@example.com' } });
    expect(loginInput.value).toBe('user@example.com');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });

  it('doit soumettre et rediriger en cas de succès', async () => {
    const mockResponse = { token: '12345' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    render(<Login />);

    const form = document.querySelector('form');

    fireEvent.change(screen.getByLabelText(/Email ou nom d'utilisateur/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: 'user@example.com',
          password: 'password123',
        }),
      }));
    });

    await waitFor(() => {
      expect(authClientService.login).toHaveBeenCalledWith(mockResponse);
      expect(pushMock).toHaveBeenCalledWith('/home');
    });
  });

  it('doit afficher une erreur si la connexion échoue', async () => {
    const errorMessage = 'Identifiants invalides';

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: errorMessage }),
    });

    render(<Login />);

    const form = document.querySelector('form');
    fireEvent.change(screen.getByLabelText(/Email ou nom d'utilisateur/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeEnabled();
  });

  it('doit afficher une erreur générale si json échoue', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    });

    render(<Login />);

    const form = document.querySelector('form');
    fireEvent.change(screen.getByLabelText(/Email ou nom d'utilisateur/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeEnabled();
  });
});