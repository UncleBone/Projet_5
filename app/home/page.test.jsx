import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import Home from './page'; // adaptez le chemin selon votre projet
import { authClientService } from '../../service/auth.client.service';
import Post from './page';

// Mock next/navigation useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock authClientService
vi.mock('../../service/auth.client.service', () => ({
  authClientService: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

// Mock component Post (simplifie le rendu, sinon utilisez le vrai)
vi.mock('../../components/post', () => ({
  __esModule: true,
  default: ({ title, text, date, author }) => (
    <div data-testid="post">
      <h3>{title}</h3>
      <p>{text}</p>
      <small>{date} - {author}</small>
    </div>
  ),
}));

describe('Home page', () => {
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

  it('redirige si non authentifié', () => {
    authClientService.isAuthenticated.mockReturnValue(false);
    render(<Home />);
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('affiche erreur si utilisateur inconnu', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue(null);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Utilisateur inconnu')).toBeInTheDocument();
    });
  });

  it('charge et affiche les posts', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    const user = { token: 'abc123' };
    authClientService.getCurrentUser.mockReturnValue(user);

    const posts = [
      { id: '2', title: 'Post 2', text: 'Texte 2', date: '2023-02-01', users: { username: 'User2' } },
      { id: '1', title: 'Post 1', text: 'Texte 1', date: '2023-03-01', users: { username: 'User1' } },
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(posts),
    });

    render(<Home />);

    // Chargement initial
    expect(screen.getByText(/Chargement.../i)).toBeInTheDocument();

    // Attendre que posts apparaissent
    await waitFor(() => {
      expect(screen.queryByText(/Chargement.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Post 1')).toBeInTheDocument()
    expect(screen.getByText('Post 2')).toBeInTheDocument()
  });

  it('affiche message si aucun article', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue({ token: 'abc123' });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.queryByText(/Chargement.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Aucun article pour le moment')).toBeInTheDocument();
  });

  it('affiche une erreur si fetch échoue', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue({ token: 'abc123' });

    global.fetch.mockRejectedValueOnce(new Error('Erreur réseau'));

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
    });
  });

  it('permet de changer l\'ordre du tri', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue({ token: 'abc123' });

    const posts = [
      { id: '2', title: 'Post 2', text: 'Texte 2', date: '2023-02-01', users: { username: 'User2' } },
      { id: '1', title: 'Post 1', text: 'Texte 1', date: '2023-03-01', users: { username: 'User1' } },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(posts),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.queryByText(/Chargement.../i)).not.toBeInTheDocument();
    });

    let titles = screen.getAllByTestId('post').map(post => post.querySelector('h3').textContent);
    expect(titles).toEqual(['Post 1', 'Post 2']);

    fireEvent.change(screen.getByLabelText(/Trier/i), { target: { value: 'asc' } });

    titles = screen.getAllByTestId('post').map(post => post.querySelector('h3').textContent);
    expect(titles).toEqual(['Post 2', 'Post 1']);
  });
});