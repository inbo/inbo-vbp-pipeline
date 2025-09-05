import { Collection } from "./__generated__/types";

export class SolrClient {
    private readonly solrBaseUrl: string;
    constructor({ solrBaseUrl }: { solrBaseUrl: string }) {
        this.solrBaseUrl = solrBaseUrl;
    }
    getCollections(): Promise<Collection[]> {
        return fetch(`${this.solrBaseUrl}/collections`)
            .then((response) => response.json())
            .then((data) => data.collections);
    }

    getCollection(name: string): Promise<Collection> {
        return fetch(`${this.solrBaseUrl}/collections/${name}`)
            .then((response) => response.json())
            .then((data) => data.collection);
    }

    createCollection(name: string): Promise<Collection> {
        return fetch(`${this.solrBaseUrl}/collections`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name }),
        })
            .then((response) => response.json())
            .then((data) => data.collection);
    }

    deleteCollection(name: string): Promise<Collection> {
        return fetch(`${this.solrBaseUrl}/collections/${name}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => data.collection);
    }

    deleteDataResourceOccurrencesFromCollection(
        collectionId: string,
        dataResourceId: string,
    ) {
        return fetch(
            `${this.solrBaseUrl}/collections/${collectionId}/dataResourceOccurrences/${dataResourceId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "delete": { "query": `dataResourceUid:${dataResourceId}` },
                }),
            },
        )
            .then((response) => response.json())
            .then((data) => data.collection);
    }
}
