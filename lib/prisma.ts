// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '../lib/generated/prisma/client';

declare global {
  // Eviter de recréer plusieurs instances en hot reload (en dev)
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;