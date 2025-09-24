import { PaginationInput, PaginationOutput } from "./common";

export type Pipeline = {
    id: string;
    status: PipelineStatus;
    startedAt?: Date;
    stoppedAt?: Date;
};

export enum PipelineStatus {
    Aborted = "ABORTED",
    Failed = "FAILED",
    Running = "RUNNING",
    Succeeded = "SUCCEEDED",
    TimedOut = "TIMED_OUT",
}

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

export const PipelineSteps = [
    "DOWNLOAD",
    "INDEX",
    "SAMPLE",
    "SOLR",
] as const;
export type PipelineStep = typeof PipelineSteps[number];
export type PipelineStepState =
    | "SKIPPED"
    | "SUCCEEDED"
    | "FAILED"
    | "QUEUED"
    | "RUNNING";

export type PipelineStepProgress = {
    queued: number;
    running: number;
    completed: number;
    skipped: number;
    failed: number;
};

export type PipelineProgress = {
    total: number;
    completed: number;
    failed: number;
    steps: { [step in PipelineStep]: PipelineStepProgress };
};

export type DataResourceProgress = {
    dataResourceId: string;
    state: PipelineStepState;
    step: PipelineStep;
    startedAt?: Date;
    stoppedAt?: Date;
};

export type DataResourceProcessingState = {
    downloadedAt?: string;
    downloadedBy?: string;
    downloadUrl?: string;
    downloadFileSize?: number;
    downloadFileHash?: string;
    indexedAt?: string;
    indexedBy?: string;
    sampledAt?: string;
    sampledBy?: string;
    sampledLayerIds?: string[];
    uploadedAt?: string;
    uploadedBy?: string;
    uploadedTo?: string[];
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

    getPipelineProgress(
        pipelineId: string,
    ): Promise<PipelineProgress>;

    getPipelineRunDataResourceProgress(
        pipelineId: string,
        pagination: PaginationInput,
    ): Promise<PaginationOutput<DataResourceProgress>>;

    getPipelineRunDataResourceProgressCount(
        pipelineId: string,
    ): Promise<number>;

    getDataResourceProcessingStates(
        dataResourceIds: string[],
    ): Promise<DataResourceProcessingState[] | null>;

    getPipelineRunDataResourceProgress(
        pipelineId: string,
        pagination?: PaginationInput,
    ): Promise<PaginationOutput<DataResourceProgress>>;
};
