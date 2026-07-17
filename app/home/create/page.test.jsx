import React from 'react';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import Create from './page'; // adaptez le chemin si besoin
import { authClientService } from '../../../service/auth.client.service';

// Mock next/navigation useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock authClientService
vi.mock('../../../service/auth.client.service', () => ({
  authClientService: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

describe('Create page', () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useRouter.mockReturnValue({ push: pushMock });
    global.fetch = vi.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('redirige vers / si non authentifié', () => {
    authClientService.isAuthenticated.mockReturnValue(false);

    render(<Create />);

    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('affiche erreur si utilisateur inconnu', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue(null);

    render(<Create />);

    await waitFor(() => {
      expect(screen.getByText('Utilisateur inconnu')).toBeInTheDocument();
    });
  });

  it('affiche erreur si fetch topics échoue', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue({ token: 'token123' });

    global.fetch.mockRejectedValueOnce(new Error('Erreur réseau'));

    render(<Create />);

    await waitFor(() => {
      expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
    });
  });

  it('charge et affiche les topics, permet de remplir le formulaire', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue({ token: 'token123' });

    const topics = [
      { id: '1', name: 'Theme 1' },
      { id: '2', name: 'Theme 2' },
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(topics),
    });

    render(<Create />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    expect(select.value).toBe('2');

    const titleInput = screen.getByPlaceholderText("Titre de l'article");
    fireEvent.change(titleInput, { target: { value: 'Mon titre' } });
    expect(titleInput.value).toBe('Mon titre');

    const textArea = screen.getByPlaceholderText("Contenu de l'article");
    fireEvent.change(textArea, { target: { value: 'Mon contenu' } });
    expect(textArea.value).toBe('Mon contenu');
  });

  it('soumet le formulaire avec succès et affiche popup', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue({ token: 'token123' });

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // fetch topics
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }); // post création

    render(<Create />);

    await waitFor(() => screen.getByRole('combobox'));

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText("Titre de l'article"), { target: { value: 'Titre test' } });
    fireEvent.change(screen.getByPlaceholderText("Contenu de l'article"), { target: { value: 'Contenu test' } });

    const form = document.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
        expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: 'Créer' });

    await waitFor(() => {
      expect(screen.getByText('Article créé !')).toBeInTheDocument();
      expect(button).toBeEnabled();
      expect(button).toHaveTextContent('Créer');
    });

    fireEvent.click(screen.getByText('Fermer'));

    expect(screen.queryByText('Article créé !')).not.toBeInTheDocument();
  });

  it('affiche erreur de création en cas de erreur API', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue({ token: 'token123' });

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // fetch topics
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Erreur création article' }),
      }); // post création échoue

    render(<Create />);

    await waitFor(() => screen.getByRole('combobox'));

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText("Titre de l'article"), { target: { value: 'Titre test' } });
    fireEvent.change(screen.getByPlaceholderText("Contenu de l'article"), { target: { value: 'Contenu test' } });

    const form = document.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Erreur création article')).toBeInTheDocument();
    });
  });
});