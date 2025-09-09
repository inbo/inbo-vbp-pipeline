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

// Custom field, added when calling lambda directly from step function
interface CustomALBEvent extends AWSLambda.ALBEvent {
    originatesFromStepFunction?: boolean;
}

interface UserContext {
    user: User | null;
}

const resolvers: Resolvers = {
    Query: {
        index: async (_, { id }) => {
            return solrClient.getIndex(id);
        },
        indices: async () => {
            return solrClient.getIndices();
        },
        activeIndex: async () => {
            return solrClient.getActiveIndex();
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

        setActiveIndex: async (_, { input }) => {
            await solrClient.setActiveIndex(input.indexId);
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
                const user =
                    (event as CustomALBEvent).originatesFromStepFunction
                        ? null
                        : await authService.authenticate(event.headers);

                return {
                    ...context,
                    user,
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
