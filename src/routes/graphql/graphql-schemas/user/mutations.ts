import { ContextType } from '../../types/context.js';
import { UserType, CreateUserInputType } from './types.js';

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
};

export default UserMutations;
