import { GraphQLList, GraphQLResolveInfo } from 'graphql';
import {
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
  ResolveTree,
} from 'graphql-parse-resolve-info';

import { ContextType } from '../../types/context.js';
import { UUIDType } from '../../types/uuid.js';
import { UserSchemaType, UserType } from './types.js';

const UserQueries = {
  users: {
    type: new GraphQLList(UserType),
    resolve: async (
      _parent: unknown,
      _args: unknown,
      context: ContextType,
      resolveInfo: GraphQLResolveInfo,
    ) => {
      const parsedResolveInfo = parseResolveInfo(resolveInfo);
      const { fields } = simplifyParsedResolveInfoFragmentWithType(
        parsedResolveInfo as ResolveTree,
        resolveInfo.returnType,
      );

      const users: UserSchemaType[] = await context.prismaClient.user.findMany({
        include: {
          subscribedToUser: 'subscribedToUser' in fields,
          userSubscribedTo: 'userSubscribedTo' in fields,
        },
      });

      users.forEach((user) => {
        context.dataloaders.userDataLoader.prime(user.id, user);
      });

      return users;
    },
  },

  user: {
    type: UserType,
    args: { id: { type: UUIDType } },
    resolve: async (_parent: unknown, args: { id: string }, context: ContextType) => {
      const user = await context.dataloaders.userDataLoader.load(args.id);
      return user;
    },
  },
};

export default UserQueries;
