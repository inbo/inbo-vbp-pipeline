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

import IndexResolvers from "./graphql/index-resolvers";
import PipelineResolvers from "./graphql/pipeline-resolvers";
import DataResourceResolvers from "./graphql/data-resource-resolver";

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
        ...IndexResolvers.Query,
        ...DataResourceResolvers.Query,
        ...PipelineResolvers.Query,
    },
    Mutation: {
        ...IndexResolvers.Mutation,
        ...PipelineResolvers.Mutation,
    },
    Index: {
        ...IndexResolvers.Index,
    },
    Pipeline: {
        ...PipelineResolvers.Pipeline,
    },
    DataResourceProgress: {
        ...DataResourceResolvers.DataResourceProgress,
    },
};

const server = new ApolloServer<UserContext>({
    typeDefs,
    resolvers,
    csrfPrevention: false,
});

export const graphqlHandler = startServerAndCreateLambdaHandler(
    server,
    handlers.createALBEventRequestHandler(),
    {
        middleware: [
            async (event) => {
                if (event.httpMethod === "OPTIONS") {
                    return {
                        statusCode: 200,
                        body: "",
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
                            "Access-Control-Allow-Headers": "*",
                        },
                    };
                }

                console.info("REQUEST: ", event);
                return async (result) => {
                    console.info("RESULT: ", result);
                    return result;
                };
            },
        ],
        context: async (
            { event, context },
        ) => {
            try {
                const user =
                    (event as CustomALBEvent).originatesFromStepFunction
                        ? null
                        : await authService.authenticate(event.headers);

                console.info("USER: ", user);
                return {
                    ...context,
                    user,
                };
            } catch (error) {
                if (error instanceof AuthError) {
                    console.warn("Authentication error:", error);
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
