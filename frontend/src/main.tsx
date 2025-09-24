import "./styles/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
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
import { BrowserRouter, Route, Routes } from "react-router";
import { User } from "oidc-client-ts";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorLink } from "@apollo/client/link/error";
import Pipeline from "./components/Pipeline.tsx";
import DataResource from "./components/DataResourceList.tsx";
import { StartPipeline } from "./StartPipeline.tsx";
import { relayStylePagination } from "@apollo/client/utilities";

const oidcConfig = {
  authority: "https://auth-dev.inbo.be/realms/vbp",
  client_id: "vbp-pipeline-admin-ui",
  redirect_uri: window.location.origin,
  onSigninCallback: (): void => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname,
    );
  },
};
const httpLink = new HttpLink({
  uri:
    "https://natuurdata.dev.inbo.be/api/v1/biocache-index-management/graphql",
  // fetchOptions: { mode: "no-cors", credentials: "include" },
});

// Log any GraphQL errors, protocol errors, or network error that occurred

const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
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
          edges: relayStylePagination(),
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
          <BrowserRouter>
            <Routes>
              <Route element={<App />} path="/" />
              <Route element={<StartPipeline />} path="/start-pipeline" />
              <Route element={<Pipeline />} path="/pipeline/:id" />
              <Route element={<DataResource />} path="/data_resource/:id" />
            </Routes>
          </BrowserRouter>
        </ApolloProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
