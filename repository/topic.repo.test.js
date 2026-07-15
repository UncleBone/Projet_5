import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TopicRepo } from './topic.repo' // adaptez le chemin
import prisma from '../lib/prisma'

vi.mock('../lib/prisma', () => ({
  default: {
    topics: {
      findMany: vi.fn(),
    },
  },
}))

describe('TopicRepo', () => {
  let repo;

  beforeEach(() => {
    repo = new TopicRepo()
    vi.clearAllMocks()
  })

  it('should fetch all topics', async () => {
    const mockedTopics = [
      { id: 1, title: 'Topic 1', description: 'Description 1' },
      { id: 2, title: 'Topic 2', description: 'Description 2' },
    ]
    prisma.topics.findMany.mockResolvedValue(mockedTopics)

    const topics = await repo.getAll()

    expect(prisma.topics.findMany).toHaveBeenCalled()
    expect(topics).toEqual(mockedTopics)
  })
})