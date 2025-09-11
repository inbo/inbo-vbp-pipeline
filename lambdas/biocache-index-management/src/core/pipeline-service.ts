export type Pipeline = {
    id: string;
};

export type DataResourceHistory = {
    dataResourceId: string;
    rootPipelineId: string;
    executionId: string;
    event: string;
    timestamp: Date;
    lastUpdated: Date;
};

export type PipelineService = {
    getPipeline(id: string): Promise<Pipeline | null>;
    getPipelines(): Promise<Pipeline[]>;

    startPipeline(
        dataResourceIds?: string[],
        solrCollection?: string,
    ): Promise<Pipeline>;
    cancelPipeline(id: string): Promise<void>;

    getDataResourceHistory(
        dataResourceId: string,
    ): Promise<DataResourceHistory[]>;
};
