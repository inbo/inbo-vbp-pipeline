import { ApolloServer } from "@apollo/server";
import { Resolvers } from "./__generated__/types";
import config from "./config";
import typeDefs from "../schema.gql";

import {
    handlers,
    startServerAndCreateLambdaHandler,
} from "@as-integrations/aws-lambda";
import { User } from "./core/user";
import { AuthError, AuthService } from "./auth";
import { GraphQLError } from "graphql";
import { AwsPipelineServiceImpl } from "./aws-pipeline-service";

const authService = new AuthService(config);
const pipelineService = new AwsPipelineServiceImpl(config);

interface UserContext {
    user: User | null;
}

const resolvers: Resolvers = {
    Query: {
        pipeline: async (_, { id }) => {
            return pipelineService.getPipeline(id);
        },
        pipelines: async () => {
            return pipelineService.getPipelines();
        },
        dataResourceHistory: async (_, { input: { dataResourceId } }) => {
            return pipelineService.getDataResourceHistory(dataResourceId);
        },
    },
    Mutation: {
        startPipeline: async (
            _,
            { input: { dataResourceIds, solrCollection } },
        ) => {
            const pipeline = await pipelineService.startPipeline(
                dataResourceIds,
                solrCollection ? solrCollection : undefined,
            );
            return {
                pipeline,
            };
        },
        cancelPipeline: async (_, { input: { id } }) => {
            await pipelineService.cancelPipeline(id);
            const pipeline = await pipelineService.getPipeline(id);
            return {
                pipeline,
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
                const user = await authService.authenticate(event.headers);

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
