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

import { IndexMutation, IndexQuery } from "./graphql/index-resolvers";
import { PipelineMutation, PipelineQuery } from "./graphql/pipeline-resolvers";

const authService = new AuthService(config);

// Custom field, added when calling lambda directly from step function
interface CustomALBEvent extends AWSLambda.ALBEvent {
    originatesFromStepFunction?: boolean;
}

interface UserContext {
    user: User | null;
}

const resolvers: Resolvers = {
    Query: {
        ...IndexQuery,
        ...PipelineQuery,
    },
    Mutation: {
        ...IndexMutation,
        ...PipelineMutation,
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
