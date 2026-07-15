import { describe, it, expect, vi } from 'vitest'
import { UserController } from './user.controller' // adaptez le chemin

const cont = new UserController()

describe('UserController', () => {
  it('should call userService.getUserSubscriptions with userId and return result', async () => {
    const userId = 1
    const subscriptions = [{ id: 10, title: 'Topic A' }, { id: 20, title: 'Topic B' }]

    const mockGetUserSubscriptions = vi.spyOn(cont['userService'], 'getUserSubscriptions').mockResolvedValue(subscriptions)

    const result = await cont.getUserSubscriptions(userId)

    expect(mockGetUserSubscriptions).toHaveBeenCalledWith(userId)
    expect(result).toBe(subscriptions)
  })

  it('should call userService.getUserInfo with userId and return result', async () => {
    const userId = 2
    const userInfo = { id: 2, username: 'user2', email: 'user2@example.com' }

    const mockGetUserInfo = vi.spyOn(cont['userService'], 'getUserInfo').mockResolvedValue(userInfo)

    const result = await cont.getUserInfo(userId)

    expect(mockGetUserInfo).toHaveBeenCalledWith(userId)
    expect(result).toBe(userInfo)
  })

  it('should call userService.addSubscription with userId and topicId', async () => {
    const userId = 3
    const topicId = 7

    const mockAddSubscription = vi.spyOn(cont['userService'], 'addSubscription').mockResolvedValue(undefined)

    await cont.addSubscription(userId, topicId)

    expect(mockAddSubscription).toHaveBeenCalledWith(userId, topicId)
  })

  it('should call userService.removeSubscription with userId and topicId', async () => {
    const userId = 4
    const topicId = 8

    const mockRemoveSubscription = vi.spyOn(cont['userService'], 'removeSubscription').mockResolvedValue(undefined)

    await cont.removeSubscription(userId, topicId)

    expect(mockRemoveSubscription).toHaveBeenCalledWith(userId, topicId)
  })

  it('should call userService.update with userId and body and return result', async () => {
    const userId = 5
    const body = { username: 'newuser', email: 'new@example.com', password: 'secret' }
    const updatedUser = { id: 5, username: 'newuser', email: 'new@example.com' }

    const mockUpdate = vi.spyOn(cont['userService'], 'update').mockResolvedValue(updatedUser)

    const result = await cont.update(userId, body)

    expect(mockUpdate).toHaveBeenCalledWith(userId, body)
    expect(result).toBe(updatedUser)
  })
})