import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "../lambdas/biocache-index-management/schema.gql",
    documents: ["src/graphql/**/*.ts"],
    generates: {
        "src/__generated__/biocache-index-management/": {
            preset: "client",
            presetConfig: {
                gqlTagName: "gql",
            },
            plugins: [],
            config: {
                useTypeImports: true,
                // Keep the previous output shape: TS enums and untyped (any)
                // custom scalars.
                enumType: "native",
                defaultScalarType: "any",
                maybeValue: "T | null",
            },
        },
        // Plain schema types (DataResource, Pipeline, ...), which the client
        // preset no longer emits for types not used by an operation.
        "src/__generated__/biocache-index-management/schema-types.ts": {
            plugins: ["typescript"],
            config: {
                useTypeImports: true,
                enumType: "native",
                defaultScalarType: "any",
                maybeValue: "T | null",
            },
        },
    },
};

export default config;
