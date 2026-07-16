import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import FullPostComponent from './fullPost'
import { authClientService } from '../service/auth.client.service'

vi.mock('../service/auth.client.service', () => ({
  authClientService: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
  }
}))

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('next/image', () => ({
  default: (props) => <img {...props} />
}))

vi.mock('./comment', () => ({
    default: (props) => (
    <div data-testid="comment">
      <span>{props.author}</span>: <span>{props.text}</span>
    </div>
    )
  }
))

vi.mock('./back', () => ({
  default: (props) => (
  <a href={props.url} data-testid="back-link">Back</a>
)}))

vi.mock('./fullPost.module.css', () => ({
  default: {
    mainContainer: 'mainContainer',
    title: 'title',
    postHeader: 'postHeader',
    text: 'text',
    hr: 'hr',
    commentTitle: 'commentTitle',
    createCommentContainer: 'createCommentContainer',
    textarea: 'textarea',
    sendIcon: 'sendIcon',
  }
  }))

describe('FullPostComponent', () => {
  const mockUser = { token: 'token123', username: 'user1' }
  const mockPost = {
    id: 42,
    title: 'Titre du post',
    date: new Date().toISOString(),
    users: { username: 'AuteurPost' },
    topics: { name: 'Topic1' },
    text: 'Contenu du post',
    comments: [
      { id: 1, text: 'Premier commentaire', users: { username: 'Comm1' } },
      { id: 2, text: 'Second commentaire', users: { username: 'Comm2' } }
    ]
  }

  beforeEach(() => {
    authClientService.isAuthenticated.mockReturnValue(true)
    authClientService.getCurrentUser.mockReturnValue(mockUser)

    global.fetch = vi.fn((url, options) => {
      if (url === '/api/posts/42') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPost)
        })
      }
      if (url === '/api/posts/42/comment' && options.method === 'POST') {
        return Promise.resolve({ ok: true })
      }
      return Promise.reject('Unknown url')
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('redirige vers / si l\'authentification échoue', async () => {
    authClientService.isAuthenticated.mockReturnValue(false);

    render(<FullPostComponent post_id={42} />)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

   it('affiche une erreur si utilisateur non trouvé', async () => {
    authClientService.getCurrentUser.mockReturnValue(null)

    render(<FullPostComponent post_id={42} />)
    
    await waitFor(() => {
      expect(screen.getByText('Utilisateur inconnu')).toBeInTheDocument()
    })
  })

  it('affiche l\'erreur si le fetch du post échoue', async () => {
    global.fetch = vi.fn(() => Promise.reject('Fetch fail'))
    render(<FullPostComponent post_id={1} />)

    await waitFor(() => 
      expect(screen.getByText("Erreur lors du chargement de l'article")).toBeInTheDocument()
    )
  })

  it('affiche le message article non trouvé si post est null après fetch', async () => {
    global.fetch = vi.fn(() => 
      Promise.resolve({ ok: true, json: () => Promise.resolve(null) })
    )
    render(<FullPostComponent post_id={1} />)
    await waitFor(() => {
      expect(screen.getByText(/Article non trouvé/i)).toBeInTheDocument()
    })
  })

  it('affiche une erreur lors de la soumission du commentaire en cas de réponse KO', async () => {
  global.fetch = vi.fn((url, options) => {
    if (url.includes('/comment')) {
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Erreur commentaire' }),
      })
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockPost),
    })
  })

  render(<FullPostComponent post_id={42} />)

  await waitFor(() => {
    expect(screen.getByText('Titre du post')).toBeInTheDocument()
  })

  const textarea = screen.getByPlaceholderText("Écrivez ici votre commentaire")
  fireEvent.change(textarea, { target: { value: 'Mon commentaire en test' } })
  expect(textarea).toHaveValue('Mon commentaire en test')

  const button = screen.getByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getByText('Erreur commentaire')).toBeInTheDocument()
  })
})

  it('affiche le post et les commentaires, permet d’ajouter un commentaire', async () => {
    render(<FullPostComponent post_id={42} />)
    expect(screen.getByText('Chargement...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Titre du post')).toBeInTheDocument()
    })

    expect(screen.getByText('Contenu du post')).toBeInTheDocument()

    expect(screen.getAllByTestId('comment')).toHaveLength(2)
    expect(screen.getByText(/Premier commentaire/)).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText("Écrivez ici votre commentaire")
    fireEvent.change(textarea, { target: { value: 'Nouveau commentaire' } })
    expect(textarea).toHaveValue('Nouveau commentaire')

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/posts/42/comment', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token123',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          post_id: 42,
          text: 'Nouveau commentaire'
        })
      }))
    })
  })
})