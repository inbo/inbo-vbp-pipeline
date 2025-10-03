import { mergeDeep } from "./utils/merge";

type Environment = "local" | "dev" | "uat" | "prod";

const environment = process.env.NODE_ENV === "development"
    ? "local"
    : "::ENVIRONMENT::" as Environment;

const defaultSettings = {
    environment: environment,
    domain: "localhost:5173",
    locale: "nl-BE",
    auth: {
        authority: "https://auth-dev.inbo.be/realms/vbp",
        client_id: "vbp-branding",
        redirectUrl: "http://localhost:5173/pipeline/index.html",
    },
    graphql: {
        uri: "/api/v1/biocache-index-management/graphql",
    },
    logsUrl:
        "https://monitoring.natuurdata.dev.inbo.be/d/pipelines-logs-dev/pipelines-logs",
};

const envSettings = {
    local: {
        auth: {
            client_id: "vbp-pipeline-admin-ui",
        },
    },
    dev: {
        domain: "natuurdata.dev.inbo.be",
        auth: {
            authority: "https://auth-dev.inbo.be/realms/vbp",
            redirectUrl: "https://natuurdata.dev.inbo.be/pipeline/index.html",
        },
    },
    uat: {
        domain: "natuurdata.uat.inbo.be",
        auth: {
            authority: "https://auth-uat.inbo.be/realms/vbp",
            redirectUrl: "https://natuurdata.uat.inbo.be/pipeline/index.html",
        },
        logsUrl:
            "https://monitoring.natuurdata.dev.inbo.be/d/pipelines-logs-uat/pipelines-logs",
    },
    prod: {
        domain: "natuurdata.inbo.be",
        auth: {
            authority: "https://auth.inbo.be/realms/vbp",
            redirectUrl: "https://natuurdata.inbo.be/pipeline/index.html",
        },
        logsUrl:
            "https://monitoring.natuurdata.dev.inbo.be/d/pipelines-logs-prod/pipelines-logs",
    },
};

export const settings = mergeDeep(
    defaultSettings,
    envSettings[environment],
);
