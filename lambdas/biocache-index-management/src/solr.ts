import { Index } from "./core/index-service";
import { IndexService } from "./core/index-service";

export class SolrClient implements IndexService {
    private readonly solrBaseUrl: string;
    constructor({ solrBaseUrl }: { solrBaseUrl: string }) {
        this.solrBaseUrl = solrBaseUrl;
    }
    async getIndex(id: string): Promise<Index | null> {
        const response = await fetch(
            `${this.solrBaseUrl}/admin/collections?action=COLSTATUS&collection=${id}&coreInfo=true&segments=true&fieldInfo=true&sizeInfo=true&omitHeader=true`,
        );
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
                `Failed to get index ${id}: ${response.statusText}\n${errorBody}`,
            );
        }
        const data = await response.json();
        console.debug("Get collection data:", data);
        if (data[id]) {
            return { id: id };
        } else {
            return null;
        }
    }

    async getIndices(): Promise<Index[]> {
        const response = await fetch(
            `${this.solrBaseUrl}/admin/collections?action=LIST&omitHeader=true`,
        );
        const data = await response.json();
        console.debug("List collections data:", data);
        return data.collections?.map((id: string) => ({ id }));
    }

    async createIndex(id: string): Promise<Index> {
        // Create if not found
        const response = await fetch(
            `${this.solrBaseUrl}/admin/collections?action=CREATE&name=${id}&collection.configName=_default&numShards=4&omitHeader=true`,
        );
        if (response.ok) {
            const data = await response.json();
            console.debug("Create collection data:", data);
            if (!data.success) {
                throw new Error(
                    `Failed to create index: ${JSON.stringify(data)}`,
                );
            }
            return { id };
        } else {
            const errorBody = await response.text();
            throw new Error(
                `Failed to get or create index: ${response.statusText}\n${errorBody}`,
            );
        }
    }

    async deleteIndex(id: string): Promise<void> {
        const response = await fetch(
            `${this.solrBaseUrl}/admin/collections?action=DELETE&name=${id}&omitHeader=true`,
        );
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
                `Failed to delete index ${id}: ${response.statusText}\n${errorBody}`,
            );
        }
        console.debug("Delete response:", response);
    }

    async deleteDataResourceOccurrencesFromIndex(
        indexId: string,
        dataResourceId: string,
    ): Promise<void> {
        const response = await fetch(
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
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
                `Failed to delete data resource ${dataResourceId} occurrences from index ${indexId}: ${response.statusText}\n${errorBody}`,
            );
        }
    }

    async getConfigs(): Promise<string[]> {
        const response = await fetch(
            `${this.solrBaseUrl}/admin/configs?action=LIST&omitHeader=true`,
        );
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
                `Failed to get configs: ${response.statusText}\n${errorBody}`,
            );
        }
        const data = await response.json();
        return data.configSets;
    }
}
