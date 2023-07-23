import { ContextType } from '../../types/context.js';
import { CreateProfileInputType, ProfileType } from './types.js';

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
};

export default ProfileMutations;
