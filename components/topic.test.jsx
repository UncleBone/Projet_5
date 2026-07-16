import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Topic from './topic'

describe('Topic component', () => {
  const baseProps = {
    title: 'Sujet test',
    description: 'Description du sujet',
    handleClick: vi.fn(),
  }

  beforeEach(() => {
    baseProps.handleClick.mockClear()
  })

  it('should display title and description', () => {
    render(<Topic {...baseProps} subscribed={false} profile={false} />)

    expect(screen.getByText(baseProps.title)).toBeInTheDocument()
    expect(screen.getByText(baseProps.description)).toBeInTheDocument()
  })

  it('should show "Se désabonner" button enabled when profile=true', () => {
    render(<Topic {...baseProps} subscribed={false} profile={true} />)

    const btn = screen.getByRole('button', { name: /se désabonner/i })
    expect(btn).toBeEnabled()
    expect(btn).toHaveClass('button')
  })

  it('should show "Déjà abonné" button disabled when profile=false and subscribed=true', () => {
    render(<Topic {...baseProps} subscribed={true} profile={false} />)

    const btn = screen.getByRole('button', { name: /déjà abonné/i })
    expect(btn).toBeDisabled()
    expect(btn).toHaveClass('button_disabled')
  })

  it('should show "S\'abonner" button enabled when profile=false and subscribed=false', () => {
    render(<Topic {...baseProps} subscribed={false} profile={false} />)

    const btn = screen.getByRole('button', { name: /s'abonner/i })
    expect(btn).toBeEnabled()
    expect(btn).toHaveClass('button')
  })

  it('should call handleClick when button is clicked and enabled', () => {
    render(<Topic {...baseProps} subscribed={false} profile={false} />)

    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(baseProps.handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call handleClick if button is disabled', () => {
    render(<Topic {...baseProps} subscribed={true} profile={false} />)

    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(baseProps.handleClick).not.toHaveBeenCalled()
  })
})