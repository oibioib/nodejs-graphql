import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';

import rootSchema from './graphql-schemas/root-schema.js';
import depthLimit from 'graphql-depth-limit';

const GRAPHQL_DEPTH_LIMIT = 5;

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
      const parsedQuery = parse(req.body.query);
      const validateErrors = validate(rootSchema, parsedQuery, [
        depthLimit(GRAPHQL_DEPTH_LIMIT),
      ]);

      if (validateErrors && validateErrors.length != 0) {
        return { data: '', errors: validateErrors };
      }

      const { data, errors } = await graphql({
        schema: rootSchema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: { prismaClient: fastify.prisma },
      });

      return { data, errors };
    },
  });
};

export default plugin;
