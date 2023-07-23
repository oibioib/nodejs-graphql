import { PrismaClient } from '@prisma/client';

export type ContextType = {
  prismaClient: PrismaClient;
};
