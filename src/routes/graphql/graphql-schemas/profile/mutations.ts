import { GraphQLBoolean } from 'graphql';

import { ContextType } from '../../types/context.js';
import { UUIDType } from '../../types/uuid.js';
import { ChangeProfileInputType, CreateProfileInputType, ProfileType } from './types.js';

type MutationsProfileDtoType = {
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
};

const ProfileMutations = {
  createProfile: {
    type: ProfileType,
    args: { dto: { type: CreateProfileInputType } },
    resolve: async (
      _parent: unknown,
      args: { dto: MutationsProfileDtoType },
      context: ContextType,
    ) => {
      const profile = await context.prismaClient.profile.create({ data: args.dto });
      return profile;
    },
  },

  deleteProfile: {
    type: GraphQLBoolean,
    args: { id: { type: UUIDType } },
    resolve: async (_parent: unknown, args: { id: string }, context: ContextType) => {
      try {
        await context.prismaClient.profile.delete({ where: { id: args.id } });
        return true;
      } catch (err) {
        return false;
      }
    },
  },

  changeProfile: {
    type: ProfileType,
    args: { id: { type: UUIDType }, dto: { type: ChangeProfileInputType } },
    resolve: async (
      _parent: unknown,
      args: { id: string; dto: MutationsProfileDtoType },
      context: ContextType,
    ) => {
      const profile = await context.prismaClient.profile.update({
        where: { id: args.id },
        data: args.dto,
      });
      return profile;
    },
  },
};

export default ProfileMutations;
