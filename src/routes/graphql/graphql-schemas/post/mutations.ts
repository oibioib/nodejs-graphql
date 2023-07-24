import { GraphQLBoolean } from 'graphql';

import { ContextType } from '../../types/context.js';
import { UUIDType } from '../../types/uuid.js';
import { ChangePostInputType, CreatePostInputType, PostType } from './types.js';

type MutationsPostDtoType = {
  authorId: string;
  content: string;
  title: string;
};

const PostMutations = {
  createPost: {
    type: PostType,
    args: { dto: { type: CreatePostInputType } },
    resolve: async (
      _parent: unknown,
      args: { dto: MutationsPostDtoType },
      context: ContextType,
    ) => {
      const post = await context.prismaClient.post.create({ data: args.dto });
      return post;
    },
  },

  deletePost: {
    type: GraphQLBoolean,
    args: { id: { type: UUIDType } },
    resolve: async (_parent: unknown, args: { id: string }, context: ContextType) => {
      try {
        await context.prismaClient.post.delete({ where: { id: args.id } });
        return true;
      } catch (err) {
        return false;
      }
    },
  },

  changePost: {
    type: PostType,
    args: { id: { type: UUIDType }, dto: { type: ChangePostInputType } },
    resolve: async (
      _parent: unknown,
      args: { id: string; dto: MutationsPostDtoType },
      context: ContextType,
    ) => {
      const post = await context.prismaClient.post.update({
        where: { id: args.id },
        data: args.dto,
      });
      return post;
    },
  },
};

export default PostMutations;
