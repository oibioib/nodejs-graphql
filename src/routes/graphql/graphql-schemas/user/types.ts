import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';

import DataLoader from 'dataloader';

import { ContextType, DataLoaderType } from '../../types/context.js';
import { UUIDType } from '../../types/uuid.js';
import { ProfileType, ProfileSchemaType } from '../profile/types.js';
import { PostSchemaType, PostType } from '../post/types.js';

type SubscriberSchemaType = {
  subscriberId: string;
  authorId: string;
};

export type UserSchemaType = {
  id: string;
  name: string;
  balance: number;
  profile?: ProfileSchemaType;
  posts?: PostSchemaType[];
  userSubscribedTo?: SubscriberSchemaType[];
  subscribedToUser?: SubscriberSchemaType[];
};

type UserSubscribedToType = {
  subscriberId: string;
  author: UserSchemaType;
};

type SubscribedToUserType = {
  authorId: string;
  subscriber: UserSchemaType;
};

export const UserType: GraphQLObjectType<UserSchemaType, ContextType> =
  new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: UUIDType },
      name: { type: GraphQLString },
      balance: { type: GraphQLFloat },

      profile: {
        type: ProfileType,
        resolve: async (parent, _args: unknown, context, info) => {
          let dl: DataLoaderType<ProfileSchemaType> = context.dataloaders.get(
            info.fieldNodes,
          );

          if (!dl) {
            dl = new DataLoader(async (ids: Readonly<string[]>) => {
              const profiles: ProfileSchemaType[] =
                await context.prismaClient.profile.findMany({
                  where: { userId: { in: ids as string[] } },
                });

              const sortedInIdsOrder = ids.map((id: string) =>
                profiles.find((profile) => profile.userId === id),
              );

              return sortedInIdsOrder;
            });

            context.dataloaders.set(info.fieldNodes, dl);
          }

          return dl.load(parent.id);
        },
      },

      posts: {
        type: new GraphQLList(PostType),
        resolve: async (parent, _args: unknown, context, info) => {
          let dl: DataLoaderType<PostSchemaType[]> = context.dataloaders.get(
            info.fieldNodes,
          );

          if (!dl) {
            dl = new DataLoader(async (ids: Readonly<string[]>) => {
              const posts: PostSchemaType[] = await context.prismaClient.post.findMany({
                where: { authorId: { in: ids as string[] } },
              });

              const sortedInIdsOrder = ids.map((id: string) =>
                posts.filter((post) => post.authorId === id),
              );

              return sortedInIdsOrder;
            });

            context.dataloaders.set(info.fieldNodes, dl);
          }

          return dl.load(parent.id);
        },
      },

      userSubscribedTo: {
        type: new GraphQLList(UserType),

        resolve: async (parent, _args: unknown, context, info) => {
          let dl: DataLoaderType<UserSchemaType[]> = context.dataloaders.get(
            info.fieldNodes,
          );

          if (!dl) {
            dl = new DataLoader(async (ids: Readonly<string[]>) => {
              const data: UserSubscribedToType[] =
                await context.prismaClient.subscribersOnAuthors.findMany({
                  where: { subscriberId: { in: ids as string[] } },
                  select: { author: true, subscriberId: true },
                });

              const sortedInIdsOrder = ids.map((id: string) => {
                const authors = data.filter((item) => item.subscriberId === id);
                return authors.map(({ author }) => author);
              });

              return sortedInIdsOrder;
            });

            context.dataloaders.set(info.fieldNodes, dl);
          }

          return dl.load(parent.id);
        },
      },

      subscribedToUser: {
        type: new GraphQLList(UserType),
        resolve: async (parent, _args: unknown, context, info) => {
          let dl: DataLoaderType<UserSchemaType[]> = context.dataloaders.get(
            info.fieldNodes,
          );

          if (!dl) {
            dl = new DataLoader(async (ids: Readonly<string[]>) => {
              const data: SubscribedToUserType[] =
                await context.prismaClient.subscribersOnAuthors.findMany({
                  where: { authorId: { in: ids as string[] } },
                  select: { subscriber: true, authorId: true },
                });

              const sortedInIdsOrder = ids.map((id: string) => {
                const subscribers = data.filter((item) => item.authorId === id);
                return subscribers.map(({ subscriber }) => subscriber);
              });

              return sortedInIdsOrder;
            });

            context.dataloaders.set(info.fieldNodes, dl);
          }

          return dl.load(parent.id);
        },
      },
    }),
  });

export const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

export const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});
