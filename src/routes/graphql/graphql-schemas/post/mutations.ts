import { ContextType } from '../../types/context.js';
import { CreatePostInputType, PostType } from './types.js';

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
};

export default PostMutations;
