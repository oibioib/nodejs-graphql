import { GraphQLBoolean } from 'graphql';

import { ContextType } from '../../types/context.js';
import { UUIDType } from '../../types/uuid.js';
import { UserType, CreateUserInputType, ChangeUserInputType } from './types.js';

type MutationsUserDtoType = {
  name: string;
  balance: number;
};

const UserMutations = {
  createUser: {
    type: UserType,
    args: { dto: { type: CreateUserInputType } },
    resolve: async (
      _parent: unknown,
      args: { dto: MutationsUserDtoType },
      context: ContextType,
    ) => {
      const user = await context.prismaClient.user.create({ data: args.dto });
      return user;
    },
  },

  deleteUser: {
    type: GraphQLBoolean,
    args: { id: { type: UUIDType } },
    resolve: async (_parent: unknown, args: { id: string }, context: ContextType) => {
      try {
        await context.prismaClient.user.delete({ where: { id: args.id } });
        return true;
      } catch {
        return false;
      }
    },
  },

  changeUser: {
    type: UserType,
    args: { id: { type: UUIDType }, dto: { type: ChangeUserInputType } },
    resolve: async (
      _parent: unknown,
      args: { id: string; dto: MutationsUserDtoType },
      context: ContextType,
    ) => {
      const user = await context.prismaClient.user.update({
        where: { id: args.id },
        data: args.dto,
      });
      return user;
    },
  },

  subscribeTo: {
    type: UserType,
    args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
    resolve: async (
      _parent: unknown,
      args: { userId: string; authorId: string },
      context: ContextType,
    ) => {
      await context.prismaClient.subscribersOnAuthors.create({
        data: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      });

      const user = context.prismaClient.user.findUnique({ where: { id: args.userId } });
      return user;
    },
  },

  unsubscribeFrom: {
    type: GraphQLBoolean,
    args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
    resolve: async (
      _parent: unknown,
      args: { userId: string; authorId: string },
      context: ContextType,
    ) => {
      try {
        await context.prismaClient.subscribersOnAuthors.deleteMany({
          where: {
            subscriberId: args.userId,
            authorId: args.authorId,
          },
        });
        return true;
      } catch {
        return false;
      }
    },
  },
};

export default UserMutations;
