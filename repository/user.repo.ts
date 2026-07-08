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
}