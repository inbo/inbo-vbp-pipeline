import {
    DataResource,
    DataResourceDetails,
    DataResourceRepository,
} from "../core/data-resource";

export class CollectoryClient implements DataResourceRepository {
    private collectoryBaseUrl: string;

    // Simple in-memory cache to avoid repeated fetches for the same data resource, should be fine for short-lived Lambda invocations
    private cache: Map<string, DataResourceDetails> = new Map();

    constructor({ collectoryBaseUrl }: { collectoryBaseUrl: string }) {
        this.collectoryBaseUrl = collectoryBaseUrl;
    }

    async getDataResources(): Promise<DataResource[]> {
        console.debug("Getting data resources from Collectory");

        const response = await fetch(
            `${this.collectoryBaseUrl}/ws/dataResource`,
        );
        if (!response.ok) {
            throw new Error(
                `Failed to get data resources: ${response.statusText}`,
            );
        }
        const output = await response.json();
        return output.map((dr: any) => ({
            id: dr.uid,
            name: dr.name,
        }));
    }

    async getDataResource(
        dataResourceId: string,
    ): Promise<DataResourceDetails> {
        if (this.cache.has(dataResourceId)) {
            return this.cache.get(dataResourceId)!;
        }

        console.debug(
            "Getting data resource from Collectory with id:",
            dataResourceId,
        );

        const response = await fetch(
            `${this.collectoryBaseUrl}/ws/dataResource/${dataResourceId}`,
        );
        if (!response.ok) {
            throw new Error(
                `Failed to get data resource ${dataResourceId}: ${response.statusText}`,
            );
        }
        const output = await response.json();
        const result: DataResourceDetails = {
            id: output.uid,
            name: output.name,
            url: output.url,
            createdAt: new Date(output.dateCreated),
            checkedAt: new Date(output.lastChecked),
            updatedAt: new Date(output.lastUpdated),
            processedAt: output.dataCurrency ?? new Date(output.dataCurrency),
        };
        this.cache.set(dataResourceId, result);
        return result;
    }
}
