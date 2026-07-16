import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Back from './back'

vi.mock('next/image', () => ({
  default: (props) => {
    return <img {...props} />
  }
}))

describe('Back component', () => {
  it('renders a link with correct href and class for "/" url', () => {
    render(<Back url='/' />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
    expect(link.className).toContain('back')
    const img = screen.getByAltText('retour')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/images/arrow.png')
  })

  it('renders a link with alternate class for other urls', () => {
    render(<Back url='/other' />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/other')
    expect(link.className).toContain('back_alt')
  })
})