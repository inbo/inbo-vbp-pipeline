import {
    DataResource,
    DataResourceDetails,
    DataResourceRepository,
} from "../core/data-resource";

export class CollectoryClient implements DataResourceRepository {
    private collectoryBaseUrl: string;

    constructor({ collectoryBaseUrl }: { collectoryBaseUrl: string }) {
        this.collectoryBaseUrl = collectoryBaseUrl;
    }

    async getDataResources(): Promise<DataResource[]> {
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
        const response = await fetch(
            `${this.collectoryBaseUrl}/ws/dataResource/${dataResourceId}`,
        );
        if (!response.ok) {
            throw new Error(
                `Failed to get data resource ${dataResourceId}: ${response.statusText}`,
            );
        }
        const output = await response.json();
        return {
            id: output.uid,
            name: output.name,
        };
    }
}
