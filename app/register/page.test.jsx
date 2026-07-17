import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import Register from './page'; 
import {authClientService} from '../../service/auth.client.service';
import {useRouter} from 'next/navigation';

// Mocks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../../service/auth.client.service', () => ({
  authClientService: {
    login: vi.fn(),
  },
}));

// Mock fetch globale
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Register component', () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: pushMock,
    });
    vi.clearAllMocks();
  });

  it('doit afficher correctement le formulaire initial', () => {
    render(<Register />);

    expect(screen.getByRole('heading', {name: /inscription/i})).toBeInTheDocument();
    expect(screen.getByLabelText(/nom d'utilisateur/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
    expect(screen.getByLabelText(/password/i)).toHaveValue('');
    expect(screen.getByRole('button', {name: /s'inscrire/i})).toBeEnabled();
  });

  it('met à jour les champs de formulaire quand on saisit', () => {
    render(<Register />);

    const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
    fireEvent.change(usernameInput, {target: {value: 'monUser', name: 'username'}});
    expect(usernameInput).toHaveValue('monUser');

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, {target: {value: 'user@test.com', name: 'email'}});
    expect(emailInput).toHaveValue('user@test.com');

    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, {target: {value: '12345678', name: 'password'}});
    expect(passwordInput).toHaveValue('12345678');
  });

  it('soumet le formulaire avec succès et redirige', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({token: 'token'}),
    });

    render(<Register />);
    // Remplir les inputs
    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), {target: {value: 'monUser', name: 'username'}});
    fireEvent.change(screen.getByLabelText(/email/i), {target: {value: 'user@test.com', name: 'email'}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: '12345678', name: 'password'}});

    fireEvent.click(screen.getByRole('button', {name: /s'inscrire/i}));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          username: 'monUser',
          email: 'user@test.com',
          password: '12345678'
        }),
      }));
    });

    await waitFor(() => {
      // Vérifie que authClientService.login a été appelé avec les données renvoyées
      expect(authClientService.login).toHaveBeenCalledWith({token: 'token'});
      // Vérifie que la redirection a été déclenchée
      expect(pushMock).toHaveBeenCalledWith('/home');
    });
  });

  it('affiche un message d’erreur en cas d’échec', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({message: 'Erreur personnalisée'}),
    });

    render(<Register />);

    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), {target: {value: 'monUser', name: 'username'}});
    fireEvent.change(screen.getByLabelText(/email/i), {target: {value: 'user@test.com', name: 'email'}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: '12345678', name: 'password'}});

    fireEvent.click(screen.getByRole('button', {name: /s'inscrire/i}));

    const errorMessage = await screen.findByText(/erreur personnalisée/i);
    expect(errorMessage).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('désactive le bouton pendant le chargement', async () => {
    let resolveFetch;
    mockFetch.mockImplementationOnce(() => {
      return new Promise(resolve => {
        resolveFetch = resolve;
      });
    });

    render(<Register />);

    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), {target: {value: 'monUser', name: 'username'}});
    fireEvent.change(screen.getByLabelText(/email/i), {target: {value: 'user@test.com', name: 'email'}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: '12345678', name: 'password'}});

    fireEvent.click(screen.getByRole('button', {name: /s'inscrire/i}));

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent(/inscription en cours/i);

    // Résoudre la promesse pour finir le test
    resolveFetch && resolveFetch({
      ok: true,
      json: async () => ({token: 'token'}),
    });

    // Attendre la fin pour éviter erreurs async
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeEnabled();
    });
  });
});