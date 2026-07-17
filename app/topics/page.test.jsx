import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Topics from './page'; 
import { authClientService } from '../../service/auth.client.service';
import { useRouter } from 'next/navigation';

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

// Mock du service d'authentification
vi.mock('../../service/auth.client.service', () => ({
  authClientService: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn()
  }
}));

global.fetch = vi.fn();

describe('Topics component', () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useRouter.mockReturnValue({ push: pushMock });
  });

  it('redirige vers / si non authentifié', () => {
    authClientService.isAuthenticated.mockReturnValue(false);

    render(<Topics />);

    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('affiche erreur si utilisateur inconnu', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue(null);

    render(<Topics />);

    expect(await screen.findByText(/Utilisateur inconnu/)).toBeInTheDocument();
  });

  it('affiche chargement au démarrage', () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue({ token: 'token123' });

    render(<Topics />);

    expect(screen.getByText(/Chargement.../)).toBeInTheDocument();
  });

  it('affiche erreur si fetch topics ou subs échoue', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue({ token: 'token123' });

    fetch.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/topics')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, name: 'Topic 1', description: 'Desc 1' }]) });
      }
      return Promise.resolve({ ok: false });
    });

    render(<Topics />);

    expect(await screen.findByText(/Erreur lors du chargement des données/i)).toBeInTheDocument();
  });

  it('affiche les topics et gère abonnement', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue({ token: 'token123' });

    const topics = [
      { id: 1, name: 'Topic 1', description: 'Desc 1' },
      { id: 2, name: 'Topic 2', description: 'Desc 2' }
    ];
    const subs = [{ id: 1 }];

    fetch.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/topics')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(topics) });
      }
      if (typeof url === 'string' && url.includes('/api/user/subscriptions')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(subs) });
      }
      if (typeof url === 'string' && url.includes('/api/user/subscriptions/2')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: false });
    });

    render(<Topics />);
    
    await waitFor(() => expect(screen.queryByText(/Chargement.../)).not.toBeInTheDocument());

    expect(screen.getByText('Topic 1')).toBeInTheDocument();
    expect(screen.getByText('Desc 1')).toBeInTheDocument();
    expect(screen.getByText('Topic 2')).toBeInTheDocument();

  });

  it('ajoute un abonnement au clic sur le topic non abonné', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue({ token: 'token123' });

    const topics = [
        { id: 1, name: 'Topic 1', description: 'Desc 1' },
        { id: 2, name: 'Topic 2', description: 'Desc 2' }
    ];
    const subs = [{ id: 1 }]; // abonné au topic 1 seulement

    fetch.mockImplementation((url, options) => {
        if (typeof url === 'string' && url.includes('/api/topics')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(topics) });
        }
        if (typeof url === 'string' && url.includes('/api/user/subscriptions')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(subs) });
        }
        if (typeof url === 'string' && url.includes('/api/user/subscriptions/2') && options?.method === 'POST') {
        return Promise.resolve({ ok: true });
        }
        return Promise.resolve({ ok: false });
    });

    render(<Topics />);
    
    await waitFor(() => expect(screen.queryByText(/Chargement.../)).not.toBeInTheDocument());

    // On cible le bouton du topic 2 (non abonné)
    const topic2Element = screen.getByText('Topic 2').closest('div'); 
    const subscribeBtn = within(topic2Element).getByRole('button');
    
    // Avant clic, le topic 2 n'est pas abonné (par exemple absence d'un marqueur)
    expect(subscribeBtn).toHaveTextContent("S'abonner");

    // Simuler clic
    fireEvent.click(subscribeBtn);

    // Attendre que l'état soit mis à jour: par exemple le bouton passe à "abonné"
    await waitFor(() => {
        // Selon votre UI, vérifiez un changement visible; ici un exemple théorique:
        expect(subscribeBtn).toHaveTextContent(/Déjà abonné/i);
    });
    });
});