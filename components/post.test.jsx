import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Post from './post'

describe('Post component', () => {
  const props = {
    title: 'Titre de l’article',
    text: 'Ceci est le contenu du post.',
    date: '2024-06-01',
    author: 'Alice',
  }

  it('should render the post with correct content and classes', () => {
    render(<Post {...props} />)

    // Titre
    const titleEl = screen.getByText(props.title)
    expect(titleEl).toBeInTheDocument()
    expect(titleEl.className).toContain('title')

    // Date
    const dateEl = screen.getByText(props.date)
    expect(dateEl).toBeInTheDocument()
    expect(dateEl.className).toContain('date')

    // Auteur
    const authorEl = screen.getByText(new RegExp(`par ${props.author}`))
    expect(authorEl).toBeInTheDocument()
    expect(authorEl.className).toContain('author')

    // Texte
    const textEl = screen.getByText(props.text)
    expect(textEl).toBeInTheDocument()
    expect(textEl.className).toContain('text')

    // Conteneur principal
    const cardEl = titleEl.closest('div')
    expect(cardEl).toBeInTheDocument()
    expect(cardEl.className).toContain('card')
  })
})