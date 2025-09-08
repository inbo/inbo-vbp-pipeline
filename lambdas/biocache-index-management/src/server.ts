import { ApolloServer } from "@apollo/server";
import { Resolvers } from "./__generated__/types";
import { SolrClient } from "./solr";
import config from "./config";
import typeDefs from "../schema.gql";

import {
    handlers,
    startServerAndCreateLambdaHandler,
} from "@as-integrations/aws-lambda";
import { User } from "./core/user";
import { AuthError, AuthService } from "./auth";
import { GraphQLError } from "graphql";

const authService = new AuthService(config);
const solrClient = new SolrClient(config);

interface UserContext {
    user: User;
}

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
            const index = await solrClient.getIndex(input.indexId);
            if (index) {
                return { indexId: index.id };
            } else {
                const newIndex = await solrClient.createIndex(input.indexId);
                return {
                    indexId: newIndex.id,
                };
            }
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

const server = new ApolloServer<UserContext>({
    typeDefs,
    resolvers,
});

export const graphqlHandler = startServerAndCreateLambdaHandler(
    server,
    handlers.createALBEventRequestHandler(),
    {
        context: async (
            { event, context },
        ) => {
            try {
                return {
                    ...context,
                    user: await authService.authenticate(event.headers),
                };
            } catch (error) {
                if (error instanceof AuthError) {
                    throw new GraphQLError("User authentication failed", {
                        extensions: {
                            code: error.code,
                            http: { status: error.status() },
                        },
                    });
                } else {
                    throw error;
                }
            }
        },
    },
);
