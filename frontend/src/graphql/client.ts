import {
    ApolloClient,
    CombinedGraphQLErrors,
    CombinedProtocolErrors,
    HttpLink,
    InMemoryCache,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { relayStylePagination } from "@apollo/client/utilities";
import { settings } from "../settings";
import { oidcConfig } from "../auth";
import { User } from "oidc-client-ts";

const errorLink = new ErrorLink(({ error }) => {
    if (CombinedGraphQLErrors.is(error)) {
        error.errors.forEach(({ message, locations, path }) =>
            console.log(
                `[GraphQL error]: Message: ${message}, Location: ${
                    JSON.stringify(locations, null, 2)
                }, Path: ${path}`,
            )
        );
    } else if (CombinedProtocolErrors.is(error)) {
        error.errors.forEach(({ message, extensions }) => {
            console.log(
                `[Protocol error]: Message: ${message}, Extensions: ${
                    JSON.stringify(
                        extensions,
                    )
                }`,
            );
        });
    } else {
        console.error(`[Network error]: ${error}`);
    }
});

function getUser() {
    const oidcStorage = sessionStorage.getItem(
        `oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`,
    );
    if (!oidcStorage) {
        return null;
    }

    return User.fromStorageString(oidcStorage);
}

const httpLink = new HttpLink({
    uri: settings.graphql.uri,
});

const authLink = new SetContextLink(({ headers }) => {
    const user = getUser();
    return {
        headers: {
            ...headers,
            authorization: user?.access_token
                ? `Bearer ${user.access_token}`
                : "",
        },
    };
});

export const client = new ApolloClient({
    link: errorLink.concat(authLink.concat(httpLink)),
    cache: new InMemoryCache({
        typePolicies: {
            Pipeline: {
                fields: {
                    dataResourceProgress: relayStylePagination([
                        "id",
                        "step",
                        "state",
                    ]),
                    stats: {
                        merge(existing, incoming, { cache, readField }) {
                            // When stats change, evict the dataResourceProgress cache
                            // for this pipeline to ensure fresh data is fetched
                            const pipelineId = readField("id");
                            if (pipelineId && existing && incoming) {
                                // Check if stats actually changed by comparing stringified versions
                                const existingStr = JSON.stringify(existing);
                                const incomingStr = JSON.stringify(incoming);

                                if (existingStr !== incomingStr) {
                                    // Evict all dataResourceProgress cache entries for this pipeline
                                    cache.evict({
                                        id: cache.identify({
                                            __typename: "Pipeline",
                                            id: pipelineId,
                                        }),
                                        fieldName: "dataResourceProgress",
                                    });
                                }
                            }
                            return incoming;
                        },
                    },
                },
            },
        },
    }),
});
