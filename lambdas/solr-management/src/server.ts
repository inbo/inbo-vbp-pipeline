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
        collection: async (_, { id }) => {
            return solrClient.getCollection(id);
        },
        collections: async () => {
            return solrClient.getCollections();
        },
    },
    Mutation: {
        createCollection: async (_, { input }) => {
            await solrClient.createCollection(input.collectionId);
            return {
                collectionId: input.collectionId,
            };
        },
        deleteCollection: async (_, { input }) => {
            await solrClient.deleteCollection(input.collectionId);
            return {
                collectionId: input.collectionId,
            };
        },

        clearDataResourceFromCollection: async (
            _,
            { input },
        ) => {
            await solrClient.deleteDataResourceOccurrencesFromCollection(
                input.collectionId,
                input.dataResourceId,
            );
            return {
                collectionId: input.collectionId,
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
