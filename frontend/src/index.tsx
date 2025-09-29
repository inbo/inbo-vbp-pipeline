import "./styles/index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import {
  ApolloClient,
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { AuthProvider } from "react-oidc-context";
import { SetContextLink } from "@apollo/client/link/context";
import { HashRouter, Route, Routes } from "react-router";
import { User } from "oidc-client-ts";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorLink } from "@apollo/client/link/error";
import Pipeline from "./components/Pipeline.tsx";
import DataResource from "./components/DataResourceList.tsx";
import { StartPipeline } from "./pages/StartPipeline.tsx";
import { relayStylePagination } from "@apollo/client/utilities";
import { LayoutWithAuth } from "./Layout.tsx";
import { Home } from "./pages/Home.tsx";
import { settings } from "./settings.ts";

const oidcConfig = {
  authority: settings.auth.authority,
  client_id: settings.auth.client_id,
  onSigninCallback: (): void => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname,
    );
  },
};
const httpLink = new HttpLink({
  uri: settings.graphql.uri,
});

// Log any GraphQL errors, protocol errors, or network error that occurred

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
const authLink = new SetContextLink(({ headers }) => {
  const user = getUser();
  return {
    headers: {
      ...headers,
      authorization: user?.access_token ? `Bearer ${user.access_token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache({
    typePolicies: {
      Pipeline: {
        fields: {
          dataResourceProgress: relayStylePagination(["id", "step", "state"]),
        },
      },
    },
  }),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary
      fallback={<p>Something went wrong</p>}
      onError={(e) => console.error(e)}
    >
      <AuthProvider {...oidcConfig}>
        <ApolloProvider client={client}>
          <LayoutWithAuth>
            <HashRouter>
              <Routes>
                <Route element={<Home />} path="/" />
                <Route element={<StartPipeline />} path="/start" />
                <Route element={<DataResource />} path="/data-resource/:id" />
                <Route element={<Pipeline />} path="/:id" />
              </Routes>
            </HashRouter>
          </LayoutWithAuth>
        </ApolloProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
