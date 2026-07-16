import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Comment from './comment'

describe('Comment component', () => {
  it('renders the author and text with correct classes', () => {
    const authorName = 'Alice'
    const commentText = 'Ceci est un commentaire.'

    render(<Comment author={authorName} text={commentText} />)

    const container = screen.getByText(authorName).parentElement
    expect(container.className).toContain('container')

    const author = screen.getByText(authorName)
    expect(author.className).toContain('author')

    const text = screen.getByText(commentText)
    expect(text.className).toContain('text')
  })
})