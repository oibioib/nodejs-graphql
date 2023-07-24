import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

export type DataLoaderType<T> = DataLoader<string, T | undefined, string> | undefined;

export type ContextType = {
  prismaClient: PrismaClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataloaders: WeakMap<object, DataLoader<string, any, string>>;
};
