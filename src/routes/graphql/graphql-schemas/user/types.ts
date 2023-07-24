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

              const profilesByIds = ids.map((id: string) =>
                profiles.find((profile) => profile.userId === id),
              );

              return profilesByIds;
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

              const postsByIds = ids.map((id: string) =>
                posts.filter((post) => post.authorId === id),
              );

              return postsByIds;
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
              const users: UserSchemaType[] = await context.prismaClient.user.findMany({
                include: {
                  userSubscribedTo: false,
                  subscribedToUser: true,
                },
                where: {
                  subscribedToUser: { some: { subscriberId: { in: ids as string[] } } },
                },
              });

              const authorsBiIds = ids.map((id: string) => {
                const authors = users.filter((user) => {
                  if (user.subscribedToUser) {
                    return user.subscribedToUser.find(
                      (author) => author.subscriberId === id,
                    );
                  }
                  return null;
                });
                return authors;
              });

              return authorsBiIds;
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
              const users: UserSchemaType[] = await context.prismaClient.user.findMany({
                include: {
                  userSubscribedTo: true,
                  subscribedToUser: false,
                },
                where: {
                  userSubscribedTo: { some: { authorId: { in: ids as string[] } } },
                },
              });

              const subscribersByIds = ids.map((id: string) => {
                const subscribers = users.filter((user) => {
                  if (user.userSubscribedTo) {
                    return user.userSubscribedTo.find(
                      (subscriber) => subscriber.authorId === id,
                    );
                  }
                  return null;
                });
                return subscribers;
              });

              return subscribersByIds;
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
