import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';

import rootSchema from './graphql-schemas/root-schema.js';
import depthLimit from 'graphql-depth-limit';
import getDataLoaders from './dataloaders/dataloaders.js';

const GRAPHQL_DEPTH_LIMIT = 5;
const QUERY_VALIDATING_ERROR_MESSAGE = 'Error validating request query!';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const {
        body: { query, variables },
      } = req;

      const validateErrors = validate(rootSchema, parse(query), [
        depthLimit(GRAPHQL_DEPTH_LIMIT),
      ]);

      if (validateErrors.length) {
        return {
          data: {
            message: QUERY_VALIDATING_ERROR_MESSAGE,
          },
          errors: validateErrors,
        };
      }

      const contextValue = {
        prismaClient: fastify.prisma,
        dataloaders: getDataLoaders(fastify.prisma),
      };

      const { data, errors } = await graphql({
        schema: rootSchema,
        source: query,
        variableValues: variables,
        contextValue,
      });

      return { data, errors };
    },
  });
};

export default plugin;
