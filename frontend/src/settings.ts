import { mergeDeep } from "./utils/merge";

type Environment = "local" | "dev" | "uat" | "prod";

const environment = process.env.NODE_ENV === "development"
    ? "local"
    : "::ENVIRONMENT::" as Environment;

const defaultSettings = {
    domain: "localhost:5173",
    auth: {
        authority: "https://auth-dev.inbo.be/realms/vbp",
        client_id: "vbp-pipeline-admin-ui",
    },
    graphql: {
        uri: "/api/v1/biocache-index-management/graphql",
    },
};

const envSettings = {
    local: {},
    dev: {
        domain: "natuurdata.dev.inbo.be",
        auth: {
            authority: "https://auth-dev.inbo.be/realms/vbp",
        },
    },
    uat: {
        domain: "natuurdata.uat.inbo.be",
        auth: {
            authority: "https://auth-uat.inbo.be/realms/vbp",
        },
    },
    prod: {
        domain: "natuurdata.inbo.be",
        auth: {
            authority: "https://auth.inbo.be/realms/vbp",
        },
    },
};

export const settings = mergeDeep(
    defaultSettings,
    envSettings[environment],
);
