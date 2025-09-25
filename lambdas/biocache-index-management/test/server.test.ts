import { ApolloServer, BaseContext } from "@apollo/server";
import { resolvers } from "../src/server";
import { readFile } from "fs/promises";
import path from "path";
import { createJWKSMock } from "mock-jwks";
import { startStandaloneServer } from "@apollo/server/standalone";

describe("Server", () => {
    let url: string;

    beforeAll(async () => {
        const typeDefs = await readFile(
            path.join(__dirname, "../schema.gql"),
            "utf-8",
        );
        const testServer = new ApolloServer<BaseContext>({
            typeDefs,
            resolvers,
        });

        const jwksMock = createJWKSMock("http://localhost:9999");
        const thunk = jwksMock.start();
        ({ url } = await startStandaloneServer(testServer));

        return async () => {
            testServer.stop();
            thunk();
        };
    });

    test("is running", async () => {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "{ indices { id } }" }),
        });
        expect(response.ok).toBe(true);
    });
});
