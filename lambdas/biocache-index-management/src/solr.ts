import { Index } from "./core/index-service";
import { IndexService } from "./core/index-service";

export class SolrClient implements IndexService {
    private readonly solrBaseUrl: string;
    constructor({ solrBaseUrl }: { solrBaseUrl: string }) {
        this.solrBaseUrl = solrBaseUrl;
    }
    async getIndex(id: string): Promise<Index> {
        const response = await fetch(`${this.solrBaseUrl}/collections/${id}`);
        const data = await response.json();
        return { id: data.collection.id };
    }

    async getIndices(): Promise<Index[]> {
        const response = await fetch(`${this.solrBaseUrl}/collections`);
        const data = await response.json();
        return data.collections.map((c: any) => ({ id: c.id }));
    }

    async getOrCreateIndex(id: string): Promise<Index> {
        // Try to get, if not found, create
        const response = await fetch(
            `${this.solrBaseUrl}/collections/${id}`,
        );
        if (response.ok) {
            const data = await response.json();
            return { id: data.collection.id };
        } else if (response.status === 404) {
            // Create if not found
            const createResponse = await fetch(
                `${this.solrBaseUrl}/collections`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: id }),
                },
            );
            const createData = await createResponse.json();
            return { id: createData.collection.id };
        } else {
            const errorBody = await response.text();
            throw new Error(
                `Failed to get or create index: ${response.statusText}\n${errorBody}`,
            );
        }
    }

    async deleteIndex(id: string): Promise<void> {
        await fetch(`${this.solrBaseUrl}/collections/${id}`, {
            method: "DELETE",
        });
    }

    async deleteDataResourceOccurrencesFromIndex(
        indexId: string,
        dataResourceId: string,
    ): Promise<void> {
        await fetch(
            `${this.solrBaseUrl}/collections/${indexId}/dataResourceOccurrences/${dataResourceId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "delete": { "query": `dataResourceUid:${dataResourceId}` },
                }),
            },
        );
    }
}
