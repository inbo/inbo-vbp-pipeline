import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "./schema.gql",
    generates: {
        "./src/__generated__/types.ts": {
            plugins: ["typescript", "typescript-resolvers"],
        },
    },
};

export default config;
