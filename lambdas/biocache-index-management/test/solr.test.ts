import { SolrClient } from "../src/solr/solr";
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

        solrClient = new SolrClient({
            solrBaseUrl: solrBaseUrl,
            solrBiocacheSchemaConfig: "_default",
            solrBiocacheActiveAlias: "biocache",
            solrBiocacheNumberOfShards: 1,
            solrBiocacheMaxShardsPerNode: 1,
            solrBiocacheIndexNamePrefix: "biocache-",
        });
    });

    afterAll(async () => {
        await solrContainer.stop();
    });

    test("should be able to create an index", async () => {
        // GIVEN
        const indexName = "biocache-testcollection";

        // WHEN
        const index = await solrClient.createIndex(indexName);

        // THEN
        expect(index.id).toBe(indexName);

        const indices = await solrClient.getIndices();
        expect(indices.map((i) => i.id)).toContain(indexName);

        // const fetched = await solrClient.getIndex(indexName);
        // expect(fetched?.id).toBe(indexName);
    });

    test("should be able to delete an index", async () => {
        // GIVEN
        const indexName = "biocache-deletecollection";
        await solrClient.createIndex(indexName);
        let indices = await solrClient.getIndices();
        expect(indices.map((i) => i.id)).toContain(indexName);

        // WHEN
        await solrClient.deleteIndex(indexName);

        // THEN
        indices = await solrClient.getIndices();
        expect(indices.map((i) => i.id)).not.toContain(indexName);

        // await expect(solrClient.getIndex(indexName)).resolves.toBeNull();
    });

    test("should set and get active index", async () => {
        const indexName = "activecollection";
        await solrClient.createIndex(indexName);
        await solrClient.setActiveIndex(indexName);
        const active = await solrClient.getActiveIndex();
        expect(active?.id).toBe(indexName);
    });

    test("should clear data resource from index", async () => {
        const indexName = "clearcollection";
        await solrClient.createIndex(indexName);
        // Add a document with dataResourceUid
        const doc = {
            id: "doc1",
            dataResourceUid: "resource1",
        };
        await fetch(
            `${solrBaseUrl}/${indexName}/update/json?commit=true`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ add: { doc } }),
            },
        );
        // Confirm document exists
        let res = await fetch(
            `${solrBaseUrl}/${indexName}/select?q=id:doc1&wt=json`,
        );
        let data = await res.json();
        expect(data.response.numFound).toBe(1);

        // Clear data resource
        await solrClient.deleteDataResourceOccurrencesFromIndex(
            indexName,
            "resource1",
        );

        // Confirm document is deleted
        res = await fetch(
            `${solrBaseUrl}/${indexName}/select?q=id:doc1&wt=json`,
        );
        data = await res.json();
        expect(data.response.numFound).toBe(0);
    });
});
