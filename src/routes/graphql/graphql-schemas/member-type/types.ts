import {
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import ProfileType from '../profile/types.js';
import { ContextType } from '../../types/context.js';

type MemberTypeParentType = { id: string };

export const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});

const MemberType: GraphQLObjectType<MemberTypeParentType, ContextType> =
  new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
      id: { type: new GraphQLNonNull(MemberTypeId) },
      discount: { type: GraphQLFloat },
      postsLimitPerMonth: { type: GraphQLInt },

      profiles: {
        type: new GraphQLList(ProfileType),
        resolve: async (parent: { id: string }, _args: unknown, context: ContextType) => {
          const profiles = await context.prismaClient.profile.findMany({
            where: { memberTypeId: parent.id },
          });
          return profiles;
        },
      },
    }),
  });

export default MemberType;
