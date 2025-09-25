import { createDefaultPreset, pathsToModuleNameMapper } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.ts"],
  setupFiles: ["<rootDir>/test/setup-env.ts"],
  transform: {
    "\\.(gql|graphql)$": "./test/graphql-import-transformer.js",
    ...tsJestTransformCfg,
  },
};
