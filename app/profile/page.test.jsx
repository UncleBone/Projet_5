import {render, screen, fireEvent, waitFor, within} from '@testing-library/react';
import {vi} from 'vitest';
import Profile from './page'; 
import {authClientService} from '../../service/auth.client.service';
import {useRouter} from 'next/navigation';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock authClientService
vi.mock('../../service/auth.client.service', () => ({
  authClientService: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    login: vi.fn(),
  },
}));

// Mock composant Topic
vi.mock('@/components/topic', () => ({
  default: ({title, handleClick}) => (
    <div data-testid="topic" onClick={handleClick}>
      {title}
    </div>
  ),
}));

// Mock fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Profile component', () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useRouter.mockReturnValue({push: pushMock});
  });

  const userMock = {
    username: 'Jean',
    email: 'jean@example.com',
    token: 'token123',
  };

  it('redirige vers / si non authentifié', () => {
    authClientService.isAuthenticated.mockReturnValue(false);

    render(<Profile />);
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('affiche message d\'erreur si utilisateur inconnu', () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue(null);

    render(<Profile />);
    expect(screen.getByText(/utilisateur inconnu/i)).toBeInTheDocument();
  });

  it('charge et affiche le formulaire et abonnements', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue(userMock);

    const topicsMock = [
      {id: 1, name: 'Topic 1', description: 'Desc 1'},
      {id: 2, name: 'Topic 2', description: 'Desc 2'},
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => topicsMock,
    });

    render(<Profile />);

    const usernameInput = document.querySelector('#username_input');
    const emailInput = document.querySelector('#email_input');
    const passwordInput = document.querySelector('#password_input');

    await waitFor(() => {
      expect(usernameInput).toHaveValue(userMock.username);
      expect(emailInput).toHaveValue(userMock.email);
      expect(passwordInput).toHaveValue('');
    });

    await waitFor(() => {
      expect(screen.getByText('Topic 1')).toBeInTheDocument();
      expect(screen.getByText('Topic 2')).toBeInTheDocument();
    });
  });

  it('met à jour formData au changement des inputs', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue(userMock);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<Profile />);

    const usernameInput = document.querySelector('#username_input');
    const emailInput = document.querySelector('#email_input');
    const passwordInput = document.querySelector('#password_input');

    fireEvent.change(usernameInput, {target: {name: 'username', value: 'Pierre'}});
    fireEvent.change(emailInput, {target: {name: 'email', value: 'pierre@mail.com'}});
    fireEvent.change(passwordInput, {target: {name: 'password', value: '12345678'}});

    expect(usernameInput).toHaveValue('Pierre');
    expect(emailInput).toHaveValue('pierre@mail.com');
    expect(passwordInput).toHaveValue('12345678');
  });

it('soumet la mise à jour avec succès et montre le popup', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue(userMock);

    // Premier fetch : récupération des abonnements
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
    });

    // Deuxième fetch : mise à jour utilisateur (PUT)
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({username: 'Jean', email: 'jean@example.com', token: 'token123'}),
    });

    render(<Profile />);

    const usernameInput = document.querySelector('#username_input');
    const emailInput = document.querySelector('#email_input');
    const passwordInput = document.querySelector('#password_input');

    const form = document.querySelector('form');
    fireEvent.change(usernameInput, {target: {name: 'username', value: 'JeanUpdated'}});
    fireEvent.submit(form);

    await waitFor(() => {
        const putCall = mockFetch.mock.calls.find(([url, options]) => {
            if (url !== '/api/user') return false;
            if (!options || options.method !== 'PUT') return false;

            if (options.body !== JSON.stringify({
                username: 'JeanUpdated',
                email: 'jean@example.com',
                password: '',
            })) return false;

            return true;
        });
        expect(putCall).toBeDefined();
    });

    await waitFor(() => {
        expect(authClientService.login).toHaveBeenCalled();
        expect(screen.getByText(/mise à jour réussie/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', {name: /fermer/i}));
    expect(screen.queryByText(/mise à jour réussie/i)).not.toBeInTheDocument();
});

  it('affiche un message d\'erreur si la mise à jour échoue', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue(userMock);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({message: 'Erreur update'}),
    });

    render(<Profile />);

    const form = document.querySelector('form');
    fireEvent.submit(form);

    const errorMessage = await screen.findByText(/erreur update/i);
    expect(errorMessage).toBeInTheDocument();
    expect(authClientService.login).not.toHaveBeenCalled();
  });

  it('supprime un abonnement correctement', async () => {
    authClientService.isAuthenticated.mockReturnValue(true);
    authClientService.getCurrentUser.mockReturnValue(userMock);

    const topicsMock = [
      {id: 1, name: 'Topic 1', description: 'Desc 1'},
      {id: 2, name: 'Topic 2', description: 'Desc 2'},
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => topicsMock,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Topic 1')).toBeInTheDocument();
      expect(screen.getByText('Topic 2')).toBeInTheDocument();
    });

    const topic2Element = screen.getByText('Topic 2').closest('div'); 
    const unsubscribeBtn = within(topic2Element).getByRole('button');

    fireEvent.click(unsubscribeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Topic 2')).not.toBeInTheDocument();
    });
  });
});