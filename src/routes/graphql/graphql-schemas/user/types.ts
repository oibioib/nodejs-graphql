import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';

import { ContextType } from '../../types/context.js';
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
        resolve: async (parent, _args: unknown, context) => {
          const profile = await context.dataloaders.profileDataLoader.load(parent.id);
          return profile;
        },
      },

      posts: {
        type: new GraphQLList(PostType),
        resolve: async (parent, _args: unknown, context) => {
          const posts = await context.dataloaders.postDataLoader.load(parent.id);
          return posts;
        },
      },

      userSubscribedTo: {
        type: new GraphQLList(UserType),
        resolve: async (parent, _args: unknown, context) => {
          if (parent.userSubscribedTo && parent.userSubscribedTo.length) {
            const usersIds = parent.userSubscribedTo.map((user) => user.authorId);
            const authors = context.dataloaders.userDataLoader.loadMany(usersIds);
            return authors;
          }
        },
      },

      subscribedToUser: {
        type: new GraphQLList(UserType),
        resolve: async (parent, _args: unknown, context) => {
          if (parent.subscribedToUser && parent.subscribedToUser.length) {
            const usersIds = parent.subscribedToUser.map((user) => user.subscriberId);
            const subscribers = context.dataloaders.userDataLoader.loadMany(usersIds);
            return subscribers;
          }
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
