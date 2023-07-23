import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import UserQueries from './user/queries.js';
import ProfileQueries from './profile/queries.js';
import PostQueries from './post/queries.js';
import MemberTypeQueries from './member-type/queries.js';

import UserMutations from './user/mutations.js';
import ProfileMutations from './profile/mutations.js';
import PostMutations from './post/mutations.js';

const rootSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
      ...UserQueries,
      ...ProfileQueries,
      ...PostQueries,
      ...MemberTypeQueries,
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: () => ({
      ...UserMutations,
      ...ProfileMutations,
      ...PostMutations,
    }),
  }),
});

export default rootSchema;
