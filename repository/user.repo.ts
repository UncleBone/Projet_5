import { CreateUserDTO } from '@/dto/user.dto';
import prisma from '@/lib/prisma'

export class UserRepo {
    async getUserById(userId: number) {
        const user = await prisma.users.findUnique({
            where: { id: userId },
        });

        return user
    }

    async getUserByUsername(username: string) {
        const user = await prisma.users.findUnique({
            where: { username },
        });

        return user
    }

    async getUserByEmail(email: string) {
        const user = await prisma.users.findUnique({
            where: { email },
        });

        return user
    }

    async createUser(data: CreateUserDTO) {
        const user = await prisma.users.create({ data });
        return user
    }

    async getSubscriptions(userId: number) {
        const subs = await prisma.topics.findMany({
            where: {
                subscriptions: {
                    some: { user_id: userId }
                }
            }
        })
        return subs
    }

    async addSubscription(userId: number, topicId: number) {
        await prisma.subscriptions.create({
            data: { user_id: userId, topic_id: topicId }
        })
    }

    async removeSubscription(userId: number, topicId: number) {
        await prisma.subscriptions.delete({
            where: {
                topic_id_user_id: { user_id: userId, topic_id: topicId }
            }
        })
    }

    async updateUser(userId: number,data: CreateUserDTO) {
        const user = await prisma.users.update({ 
            where: { id: userId},
            data 
        });
        return user
    }
}