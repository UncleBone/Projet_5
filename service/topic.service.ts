import db from '@/data/mockDB'
import { TopicRepo } from '@/repository/topic.repo';

export class TopicService {
    private topicRepo = new TopicRepo;

    // getTopicFromId(id: number) {
    //     const topic = db.topics.find((t) => t.id === id ? t : null)
    //     if(!topic)
    //         throw('topic not found'); 
    //     return topic
    // };

    async getAll() {
        const topics = await this.topicRepo.getAll();
        return topics
    };

}