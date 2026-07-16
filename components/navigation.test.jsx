import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Navigation from './navigation'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: () => ({ push: pushMock }),
}))

// Mock next/image pour éviter les erreurs liées à Image de Next.js
vi.mock('next/image', () => ({
    default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
    }
}))

// Mock authClientService
vi.mock('../service/auth.client.service', () => ({
  authClientService: {
    logout: vi.fn(),
  },
}))

import { usePathname, useRouter } from 'next/navigation'
import { authClientService } from '../service/auth.client.service'

describe('Navigation component', () => {

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    pushMock.mockClear()
    authClientService.logout.mockClear()
  })

  it('should not render anything on pathname "/"', () => {
    usePathname.mockReturnValue('/')
    const { container } = render(<Navigation />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render nav with styles.nav when pathname is not /login or /register', () => {
    usePathname.mockReturnValue('/home')
    render(<Navigation />)
    const nav = screen.getByRole('navigation')
    expect(nav.className).toContain('nav')
  })

  it('should render nav with styles.nav_alt when pathname is /login', () => {
    usePathname.mockReturnValue('/login')
    render(<Navigation />)
    const nav = screen.getByRole('navigation')
    expect(nav.className).toContain('nav_alt')
  })

  it('should open and close menu on burger click and overlay click', () => {
    usePathname.mockReturnValue('/home')
    render(<Navigation />)

    const burgerButton = screen.getByRole('button', { name: /menu/i })
    expect(burgerButton).toBeVisible()
    // menu initialement fermé, burger visible
    expect(burgerButton.className).toContain('burger')

    // Avant ouverture, overlay est caché
    const overlay = document.querySelector('#overlay')
    expect(overlay.className).toContain('hide')

    // Cliquer sur burger ouvre menu
    fireEvent.click(burgerButton)

    // burger caché
    expect(burgerButton.className).toContain('hide')

    // overlay visible
    // const overlayAfter = document.querySelector(`div.${/overlay/.source}`)
    expect(overlay).toBeVisible()

    // Cliquer sur overlay ferme menu
    fireEvent.click(overlay)

    // burger visible à nouveau
    expect(burgerButton).not.toHaveClass('hide')
  })

  it('should call logout and redirect to "/" when logout clicked', () => {
    usePathname.mockReturnValue('/home')
    render(<Navigation />)

    const logoutLi = screen.getByText('Se déconnecter')
    fireEvent.click(logoutLi)

    expect(authClientService.logout).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('should apply active class to link corresponding to current pathname', () => {
    usePathname.mockReturnValue('/topics')
    render(<Navigation />)

    const topicsLink = screen.getByText('Thèmes')
    expect(topicsLink.className).toMatch(/active/)

    const articlesLink = screen.getByText('Articles')
    expect(articlesLink.className).not.toMatch(/active/)
  })

  it('should display correct user icon image depending on pathname', () => {
    usePathname.mockReturnValue('/profile')
    render(<Navigation />)
    const img = screen.getByAltText('profil')
    expect(img.src).toContain('userIcon_active.png')

    cleanup()
    // rerender with different pathname
    usePathname.mockReturnValue('/home')
    render(<Navigation />)
    const img2 = screen.getByAltText('profil')
    expect(img2.src).toContain('userIcon.png')
  })
})