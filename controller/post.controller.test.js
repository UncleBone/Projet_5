import { describe, it, expect, vi } from 'vitest'
import { PostController } from './post.controller'

const cont = new PostController()

describe('PostController', () => {
  it('should call postService.getAll with correct user and return result', async () => {
    const user = { id: 1, username: 'user1' }
    const posts = [{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }]

    const mockGetAll = vi.spyOn(cont['postService'], 'getAll').mockResolvedValue(posts)

    const result = await cont.getAll(user)

    expect(mockGetAll).toHaveBeenCalledWith(user)
    expect(result).toBe(posts)
  })

  it('should call postService.getById with correct id and return result', async () => {
    const id = 1
    const post = { id: 1, title: 'Post 1' }

    const mockGetById = vi.spyOn(cont['postService'], 'getById').mockResolvedValue(post)

    const result = await cont.getById(id)

    expect(mockGetById).toHaveBeenCalledWith(id)
    expect(result).toBe(post)
  })

  it('should call postService.create with correct userId and body', async () => {
    const userId = 1
    const body = { title: 'New post', text: 'Content' }

    const mockCreate = vi.spyOn(cont['postService'], 'create').mockResolvedValue(undefined)

    await cont.create(userId, body)

    expect(mockCreate).toHaveBeenCalledWith(userId, body)
  })

  it('should call postService.addComment with correct userId and body', async () => {
    const userId = 1
    const body = { postId: 10, text: 'New comment' }

    const mockAddComment = vi.spyOn(cont['postService'], 'addComment').mockResolvedValue(undefined)

    await cont.addComment(userId, body)

    expect(mockAddComment).toHaveBeenCalledWith(userId, body)
  })
})