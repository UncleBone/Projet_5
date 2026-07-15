import { describe, it, expect, vi } from 'vitest'
import { TopicController } from './topic.controller'

const cont = new TopicController()

describe('TopicController', () => {
  it('should call topicService.getAll and return result', async () => {
    const topics = [
      { id: 1, title: 'Topic 1' },
      { id: 2, title: 'Topic 2' },
    ]

    const mockGetAll = vi.spyOn(cont['topicService'], 'getAll').mockResolvedValue(topics)

    const result = await cont.getAll()

    expect(mockGetAll).toHaveBeenCalled()
    expect(result).toBe(topics)
  })
})