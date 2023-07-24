import { UUIDType } from '../../types/uuid.js';
import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';

import DataLoader from 'dataloader';

import { ContextType, DataLoaderType } from '../../types/context.js';
import { UserType } from '../user/types.js';
import { MemberSchemaType, MemberType, MemberTypeId } from '../member-type/types.js';

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
          const profileUser = await context.prismaClient.user.findUnique({
            where: { id: parent.userId },
          });
          return profileUser;
        },
      },

      memberType: {
        type: MemberType,
        resolve: async (parent, _args: unknown, context, info) => {
          let dl: DataLoaderType<MemberSchemaType> = context.dataloaders.get(
            info.fieldNodes,
          );

          if (!dl) {
            dl = new DataLoader(async (ids: Readonly<string[]>) => {
              const memberTypes: MemberSchemaType[] =
                await context.prismaClient.memberType.findMany({
                  where: { id: { in: ids as string[] } },
                });

              const sortedInIdsOrder = ids.map((id: string) =>
                memberTypes.find((memberType) => memberType.id === id),
              );

              return sortedInIdsOrder;
            });

            context.dataloaders.set(info.fieldNodes, dl);
          }

          return dl.load(parent.memberTypeId);
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
