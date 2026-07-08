import prisma from '@/lib/prisma'

export class PostRepo {
    async getAll() {
        const posts = await prisma.posts.findMany()
        return posts
    }
}