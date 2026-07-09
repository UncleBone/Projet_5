import prisma from '@/lib/prisma'

export class TopicRepo {
    async getAll() {
        const topics = await prisma.topics.findMany()
        return topics
    }
}