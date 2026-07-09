import prisma from '@/lib/prisma'

export class PostRepo {
    async getAll(userId: number) {
        const posts = await prisma.posts.findMany({
            where: {
                topics: {
                    subscriptions: {
                        some: { user_id: userId }
                    }
                }
            },
            include: {
                users: true,
            }
        })
        return posts
    }

    async getById(id: number) {
        const posts = await prisma.posts.findUnique({
            where: { id },
            include: {
                users: true,
                topics: true,
                comments: true
            }
        })
        return posts
    }
}