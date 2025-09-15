import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "../lambdas/biocache-index-management/schema.gql",
    documents: ["src/**/*.tsx", "src/**/*.ts"],
    generates: {
        "src/__generated__/biocache-index-management/": {
            preset: "client",
            presetConfig: {
                gqlTagName: "gql",
            },
            plugins: [],
            config: {
                useTypeImports: true,
            },
        },
    },
};

export default config;
