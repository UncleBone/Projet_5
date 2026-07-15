import { TopicRepo } from '@/repository/topic.repo';

export class TopicService {
    private topicRepo = new TopicRepo;

    async getAll() {
        const topics = await this.topicRepo.getAll();
        return topics
    };
}