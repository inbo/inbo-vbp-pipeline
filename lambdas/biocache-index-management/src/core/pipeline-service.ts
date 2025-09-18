export type Pipeline = {
    id: string;
    status: string;
    startedAt?: Date;
    stoppedAt?: Date;
};

export type PipelineDetails = Pipeline & {
    input?: string;
    output?: string;
    error?: string;
    cause?: string;
};

export type DataResourceHistory = {
    dataResourceId: string;
    rootPipelineId: string;
    executionId: string;
    event: string;
    timestamp: Date;
    lastUpdated: Date;
};

export type DataResourceProgress = {
    dataResourceId: string;
    state:
        | "STARTED"
        | "DOWNLOADING"
        | "INDEXING"
        | "SAMPLING"
        | "UPLOADING"
        | "COMPLETED"
        | "FAILED";
    startedAt?: Date;
    stoppedAt?: Date;
};

export type PipelineService = {
    getPipeline(id: string): Promise<PipelineDetails | null>;
    getPipelines(): Promise<Pipeline[]>;

    startPipeline(
        dataResourceIds?: string[],
        solrCollection?: string,
    ): Promise<Pipeline>;
    cancelPipeline(id: string): Promise<void>;

    getDataResourceHistory(
        dataResourceId: string,
    ): Promise<DataResourceHistory[]>;

    getPipelineRunDataResourceProgress(
        pipelineId: string,
    ): Promise<DataResourceProgress[]>;
};
