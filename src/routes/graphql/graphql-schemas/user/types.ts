import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList } from 'graphql';

import { ContextType } from '../../types/context.js';
import { UUIDType } from '../../types/uuid.js';
import ProfileType from '../profile/types.js';
import PostType from '../post/types.js';

type UserParentType = { id: string };

const UserType: GraphQLObjectType<UserParentType, ContextType> = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },

    profile: {
      type: ProfileType,
      resolve: async (parent, _args: unknown, context) => {
        const userProfile = await context.prismaClient.profile.findUnique({
          where: { userId: parent.id },
        });
        return userProfile;
      },
    },

    posts: {
      type: new GraphQLList(PostType),
      resolve: async (parent, _args: unknown, context) => {
        const userPosts = await context.prismaClient.post.findMany({
          where: { authorId: parent.id },
        });
        return userPosts;
      },
    },

    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (parent, _args: unknown, context) => {
        const authors = await context.prismaClient.subscribersOnAuthors.findMany({
          where: { subscriberId: parent.id },
          select: { author: true },
        });

        return authors.map(({ author }) => author);
      },
    },

    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (parent, _args: unknown, context) => {
        const subscribers = await context.prismaClient.subscribersOnAuthors.findMany({
          where: { authorId: parent.id },
          select: { subscriber: true },
        });

        return subscribers.map(({ subscriber }) => subscriber);
      },
    },
  }),
});

export default UserType;
