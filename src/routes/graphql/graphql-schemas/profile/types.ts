import { UUIDType } from '../../types/uuid.js';
import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
} from 'graphql';

import { ContextType } from '../../types/context.js';
import { UserType } from '../user/types.js';
import { MemberType, MemberTypeId } from '../member-type/types.js';

type ProfileParentType = {
  userId: string;
  memberTypeId: string;
};

export const ProfileType: GraphQLObjectType<ProfileParentType, ContextType> =
  new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
      id: { type: UUIDType },
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
      userId: { type: UUIDType },
      memberTypeId: { type: MemberTypeId },

      user: {
        type: UserType,
        resolve: async (parent, _args: unknown, context) => {
          const profileUser = await context.prismaClient.user.findUnique({
            where: { id: parent.userId },
          });
          return profileUser;
        },
      },

      memberType: {
        type: MemberType,
        resolve: async (parent, _args: unknown, context) => {
          const userMemberType = await context.prismaClient.memberType.findUnique({
            where: { id: parent.memberTypeId },
          });
          return userMemberType;
        },
      },
    }),
  });

export const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeId },
  }),
});
