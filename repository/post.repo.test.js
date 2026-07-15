import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PostRepo } from './post.repo' // adaptez le chemin
import prisma from '../lib/prisma'
import { faker } from '@faker-js/faker'

vi.mock('../lib/prisma', () => ({
  default: {
    posts: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    comments: {
      create: vi.fn(),
    },
  },
}))

const fakeCreatePostWithAuthor = { 
    title: faker.lorem.word(),
    text: faker.lorem.paragraphs(),
    author: faker.number.int,
    topic: faker.number.int
};
const fakeCreateCommentWithAuthor = { 
    text: faker.lorem.paragraphs(),
    author: faker.number.int,
    post_id: faker.number.int
} 

describe('PostRepo', () => {
  let repo;

  beforeEach(() => {
    repo = new PostRepo()
    vi.clearAllMocks()
  })

  it('should fetch all posts for a user', async () => {
    const mockedPosts = [{ id: 1, users: { id: 1 } }]
    prisma.posts.findMany.mockResolvedValue(mockedPosts)

    const userId = 123
    const posts = await repo.getAll(userId)

    expect(prisma.posts.findMany).toHaveBeenCalledWith({
      where: { topics: { subscriptions: { some: { user_id: userId } } } },
      include: { users: true },
    })
    expect(posts).toEqual(mockedPosts)
  })

  it('should fetch a post by id', async () => {
    const mockedPost = {
      id: 1,
      users: { id: 1 },
      topics: { id: 1 },
      comments: [{ id: 1, users: { id: 2 } }],
    }
    prisma.posts.findUnique.mockResolvedValue(mockedPost)

    const id = 1
    const post = await repo.getById(id)

    expect(prisma.posts.findUnique).toHaveBeenCalledWith({
      where: { id },
      include: { users: true, topics: true, comments: { include: { users: true } } },
    })
    expect(post).toEqual(mockedPost)
  })

  it('should create a new post', async () => {
    prisma.posts.create.mockResolvedValue(undefined)

    const data = fakeCreatePostWithAuthor;
    await repo.create(data)

    expect(prisma.posts.create).toHaveBeenCalledWith({ data })
  })

  it('should create a new comment', async () => {
    prisma.comments.create.mockResolvedValue(undefined)

    const data = fakeCreateCommentWithAuthor;
    await repo.createComment(data)

    expect(prisma.comments.create).toHaveBeenCalledWith({ data })
  })
})