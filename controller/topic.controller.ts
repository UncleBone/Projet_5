import { TopicService } from "@/service/topic.service";

export class TopicController {
    private topicService = new TopicService;

    async getAll() {
        return this.topicService.getAll()
    }
}