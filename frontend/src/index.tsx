import "./styles/index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import { AuthProvider } from "react-oidc-context";
import { HashRouter, Route, Routes } from "react-router";
import { ErrorBoundary } from "react-error-boundary";
import Pipeline from "./components/Pipeline.tsx";
import DataResource from "./components/DataResourceList.tsx";
import { StartPipeline } from "./pages/StartPipeline.tsx";
import { LayoutWithAuth } from "./Layout.tsx";
import { Home } from "./pages/Home.tsx";
import { ThemeProvider } from "@mui/material";
import { oidcConfig } from "./auth.ts";
import { client } from "./graphql/client.ts";
import { theme } from "./theme.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary
      fallback={<p>Something went wrong</p>}
      onError={(e) => console.error(e)}
    >
      <AuthProvider {...oidcConfig}>
        <ApolloProvider client={client}>
          <ThemeProvider theme={theme}>
            <HashRouter>
              <LayoutWithAuth>
                <Routes>
                  <Route element={<Home />} path="/" />
                  <Route element={<StartPipeline />} path="/start" />
                  <Route element={<DataResource />} path="/data-resource/:id" />
                  <Route element={<Pipeline />} path="/:id" />
                </Routes>
              </LayoutWithAuth>
            </HashRouter>
          </ThemeProvider>
        </ApolloProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
