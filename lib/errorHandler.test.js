import { describe, it, expect, vi } from 'vitest'
import { withErrorHandling } from './errorHandler' // adaptez le chemin
import { NextResponse } from 'next/server'
import { ZodError, ZodIssue } from 'zod'

describe('withErrorHandling', () => {
  it('should return handler result on success', async () => {
    const mockResponse = new Response('ok', { status: 200 })
    const handler = vi.fn().mockResolvedValue(mockResponse)

    const wrapped = withErrorHandling(handler)
    const req = new Request('http://localhost')

    const res = await wrapped(req)

    expect(handler).toHaveBeenCalledWith(req)
    expect(res).toBe(mockResponse)
  })

  it('should handle ZodError and return 400 with first error', async () => {
    const zodIssue = {
      code: 'invalid_type',
      expected: 'string',
      received: 'number',
      path: ['fieldName'],
      message: 'Expected string, received number',
    }
    const zodError = new ZodError([zodIssue])

    const handler = vi.fn().mockRejectedValue(zodError)

    const wrapped = withErrorHandling(handler)
    const req = new Request('http://localhost')

    const res = await wrapped(req)

    expect(res.status).toBe(400)
    expect(res.headers.get('Content-Type')).toBe('application/json')

    const json = await res.json()
    expect(json).toEqual({
      field: 'fieldName',
      message: 'Expected string, received number',
    })
  })

  it('should handle generic error with status and message', async () => {
    const error = { status: 401, message: 'Unauthorized' }
    const handler = vi.fn().mockRejectedValue(error)

    const wrapped = withErrorHandling(handler)
    const req = new Request('http://localhost')

    const res = await wrapped(req)

    expect(res.status).toBe(401)
    expect(res.headers.get('Content-Type')).toBe('application/json')

    const json = await res.json()
    expect(json).toEqual({ message: 'Unauthorized' })
  })

  it('should handle generic error without status or message', async () => {
    const error = {}
    const handler = vi.fn().mockRejectedValue(error)

    const wrapped = withErrorHandling(handler)
    const req = new Request('http://localhost')

    const res = await wrapped(req)

    expect(res.status).toBe(500)
    expect(res.headers.get('Content-Type')).toBe('application/json')

    const json = await res.json()
    expect(json).toEqual({ message: 'Erreur serveur' })
  })
})