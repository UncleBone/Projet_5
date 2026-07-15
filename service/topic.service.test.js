import { describe, it, expect, vi } from 'vitest';
import { TopicService } from './topic.service'; // adaptez le chemin si besoin
import { TopicRepo } from '../repository/topic.repo';
import { faker } from '@faker-js/faker';

const ser = new TopicService();

const fakeTopics = [
  { id: faker.number.int(), name: faker.lorem.word() },
  { id: faker.number.int(), name: faker.lorem.word() },
];

describe('TopicService', () => {
  describe('getAll', () => {
    it('récupère tous les topics', async () => {
      vi.spyOn(TopicRepo.prototype, 'getAll').mockResolvedValue(fakeTopics);

      const topics = await ser.getAll();

      expect(TopicRepo.prototype.getAll).toHaveBeenCalled();
      expect(topics).toEqual(fakeTopics);
    });

    it('retourne un tableau vide si aucun topic', async () => {
      vi.spyOn(TopicRepo.prototype, 'getAll').mockResolvedValue([]);

      const topics = await ser.getAll();

      expect(TopicRepo.prototype.getAll).toHaveBeenCalled();
      expect(topics).toEqual([]);
    });
  });
});