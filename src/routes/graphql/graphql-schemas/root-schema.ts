import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import UserQueries from './user/queries.js';
import ProfileQueries from './profile/queries.js';
import PostQueries from './post/queries.js';
import MemberTypeQueries from './member-type/queries.js';

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
});

export default rootSchema;
