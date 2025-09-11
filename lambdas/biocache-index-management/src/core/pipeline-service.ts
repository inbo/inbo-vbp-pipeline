export type Pipeline = {
    id: string;
};

export type DataResourceHistory = {
    id: string;
    dataResourceId: string;
    pipelineId: string;
    status: string;
    timestamp: Date;
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
