import { UUIDType } from '../../types/uuid.js';
import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';

import { ContextType } from '../../types/context.js';
import { UserType } from '../user/types.js';
import { MemberType, MemberTypeId } from '../member-type/types.js';

export type ProfileSchemaType = {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
};

export const ProfileType: GraphQLObjectType<ProfileSchemaType, ContextType> =
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
          const user = await context.prismaClient.user.findUnique({
            where: { id: parent.userId },
          });
          return user;
        },
      },

      memberType: {
        type: MemberType,
        resolve: async (parent, _args: unknown, context) => {
          const memberType = await context.dataloaders.memberTypeDataLoader.load(
            parent.memberTypeId,
          );
          return memberType;
        },
      },
    }),
  });

export const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
  }),
});

export const ChangeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeId },
  }),
});
