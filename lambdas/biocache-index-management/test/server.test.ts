import { SolrClient } from "../src/solr";
import { GenericContainer } from "testcontainers";
import fetch from "node-fetch";
import { describe, expect, test } from "@jest/globals";

jest.setTimeout(60000);

import { StartedTestContainer } from "testcontainers";

describe("SolrClient", () => {
    let solrContainer: StartedTestContainer;
    let solrClient: SolrClient;
    let solrBaseUrl: string;

    beforeAll(async () => {
        solrContainer = await new GenericContainer("solr")
            .withEnvironment({
                SOLR_MODE: "solrcloud",
            })
            .withExposedPorts(8983)
            .start();

        solrBaseUrl = `http://${solrContainer.getHost()}:${
            solrContainer.getMappedPort(8983)
        }/solr`;

        // Wait for Solr to be ready
        let ready = false;
        for (let i = 0; i < 30; i++) {
            try {
                const res = await fetch(
                    `${solrBaseUrl}/admin/cores?action=STATUS`,
                );
                if (res.ok) {
                    ready = true;
                    break;
                }
            } catch {}
            await new Promise((r) => setTimeout(r, 10_000));
        }
        if (!ready) throw new Error("Solr did not start in time");

        solrClient = new SolrClient({ solrBaseUrl });
    });

    afterAll(async () => {
        await solrContainer.stop();
    });

    test("should be able to create an index", async () => {
        // GIVEN
        const indexName = "testcollection";

        // WHEN
        const index = await solrClient.createIndex(indexName);

        // THEN
        expect(index.id).toBe(indexName);

        const indices = await solrClient.getIndices();
        expect(indices.map((i) => i.id)).toContain(indexName);

        const fetched = await solrClient.getIndex(indexName);
        expect(fetched?.id).toBe(indexName);
    });

    test("should be able to delete an index", async () => {
        // GIVEN
        const indexName = "deletecollection";
        await solrClient.createIndex(indexName);
        const fetched = await solrClient.getIndex(indexName);
        expect(fetched?.id).toBe(indexName);

        // WHEN
        await solrClient.deleteIndex(indexName);

        // THEN
        await expect(solrClient.getIndex(indexName)).resolves.toBeNull();
    });
});
