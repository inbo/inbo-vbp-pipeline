import { ApolloServer } from "@apollo/server";
import { Resolvers } from "./__generated__/types";
import { BaseContext } from "@apollo/server";
import { SolrClient } from "./solr";
import config from "./config";
import typeDefs from "../schema.gql";

import {
    handlers,
    startServerAndCreateLambdaHandler,
} from "@as-integrations/aws-lambda";

const solrClient = new SolrClient(config);

const resolvers: Resolvers = {
    Query: {
        index: async (_, { id }) => {
            return solrClient.getIndex(id);
        },
        indices: async () => {
            return solrClient.getIndices();
        },
    },
    Mutation: {
        getOrCreateIndex: async (_, { input }) => {
            await solrClient.getOrCreateIndex(input.indexId);
            return {
                indexId: input.indexId,
            };
        },
        deleteIndex: async (_, { input }) => {
            await solrClient.deleteIndex(input.indexId);
            return {
                indexId: input.indexId,
            };
        },

        clearDataResourceFromIndex: async (
            _,
            { input },
        ) => {
            await solrClient.deleteDataResourceOccurrencesFromIndex(
                input.indexId,
                input.dataResourceId,
            );
            return {
                indexId: input.indexId,
                dataResourceId: input.dataResourceId,
            };
        },
    },
};

const server = new ApolloServer<BaseContext>({
    typeDefs,
    resolvers,
});

export const graphqlHandler = startServerAndCreateLambdaHandler(
    server,
    handlers.createAPIGatewayProxyEventV2RequestHandler(),
);
