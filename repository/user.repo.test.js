import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserRepo } from './user.repo' // adaptez le chemin
import prisma from '../lib/prisma'
import { faker } from '@faker-js/faker'

vi.mock('../lib/prisma', () => ({
  default: {
    users: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    topics: {
      findMany: vi.fn(),
    },
    subscriptions: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

const fakeCreateUserDTO = {
  username: faker.internet.username(),
  email: faker.internet.email(),
  password: faker.internet.password(),
}

describe('UserRepo', () => {
  let repo;

  beforeEach(() => {
    repo = new UserRepo()
    vi.clearAllMocks()
  })

  it('should fetch user by id', async () => {
    const mockedUser = { id: 1, username: 'testuser' }
    prisma.users.findUnique.mockResolvedValue(mockedUser)

    const userId = 1
    const user = await repo.getUserById(userId)

    expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { id: userId } })
    expect(user).toEqual(mockedUser)
  })

  it('should fetch user by username', async () => {
    const mockedUser = { username: 'testuser' }
    prisma.users.findUnique.mockResolvedValue(mockedUser)

    const username = 'testuser'
    const user = await repo.getUserByUsername(username)

    expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { username } })
    expect(user).toEqual(mockedUser)
  })

  it('should fetch user by email', async () => {
    const mockedUser = { email: 'test@example.com' }
    prisma.users.findUnique.mockResolvedValue(mockedUser)

    const email = 'test@example.com'
    const user = await repo.getUserByEmail(email)

    expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { email } })
    expect(user).toEqual(mockedUser)
  })

  it('should create a new user', async () => {
    prisma.users.create.mockResolvedValue(fakeCreateUserDTO)

    const data = fakeCreateUserDTO
    const user = await repo.createUser(data)

    expect(prisma.users.create).toHaveBeenCalledWith({ data })
    expect(user).toEqual(fakeCreateUserDTO)
  })

  it('should fetch user subscriptions', async () => {
    const mockedSubs = [{ id: 1, title: 'Topic 1' }]
    prisma.topics.findMany.mockResolvedValue(mockedSubs)

    const userId = 1
    const subs = await repo.getSubscriptions(userId)

    expect(prisma.topics.findMany).toHaveBeenCalledWith({
      where: {
        subscriptions: { some: { user_id: userId } }
      }
    })
    expect(subs).toEqual(mockedSubs)
  })

  it('should add a subscription', async () => {
    prisma.subscriptions.create.mockResolvedValue(undefined)

    const userId = 1
    const topicId = 2
    await repo.addSubscription(userId, topicId)

    expect(prisma.subscriptions.create).toHaveBeenCalledWith({
      data: { user_id: userId, topic_id: topicId }
    })
  })

  it('should remove a subscription', async () => {
    prisma.subscriptions.delete.mockResolvedValue(undefined)

    const userId = 1
    const topicId = 2
    await repo.removeSubscription(userId, topicId)

    expect(prisma.subscriptions.delete).toHaveBeenCalledWith({
      where: {
        topic_id_user_id: { user_id: userId, topic_id: topicId }
      }
    })
  })

  it('should update a user', async () => {
    const updatedUser = { id: 1, username: 'updateduser' }
    prisma.users.update.mockResolvedValue(updatedUser)

    const userId = 1
    const data = { username: 'updateduser' }
    const user = await repo.updateUser(userId, data)

    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: userId },
      data,
    })
    expect(user).toEqual(updatedUser)
  })
})