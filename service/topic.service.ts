import db from '@/data/mockDB'

export const topicService = {
    getTopicFromId(id: number) {
        const topic = db.topics.find((t) => t.id === id ? t : null)
        if(!topic)
            throw('topic not found'); 
        return topic
    },

    getAllTopics() {
        return [...db.topics]
    }

}