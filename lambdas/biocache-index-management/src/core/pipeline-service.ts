import { PaginationInput, PaginationOutput } from "./common";

export type Pipeline = {
    id: string;
    executionArn: string;
    status: PipelineStatus;
    startedAt?: Date;
    stoppedAt?: Date;
    input?: string;
    output?: string;
    error?: string;
    cause?: string;
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

export type PipelineStepStats = {
    total: number;
    queued: number;
    running: number;
    succeeded: number;
    skipped: number;
    failed: number;
};

export type PipelineStats = {
    total: PipelineStepStats;
    steps: { [step in PipelineStep]: PipelineStepStats };
};

export type DataResourceProgress = {
    dataResourceId: string;
    state: PipelineStepState;
    step: PipelineStep;
    timestamp: Date;
    error?: string;
    cause?: string;
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

    getPipelineStats(
        pipelineId: string,
    ): Promise<PipelineStats>;

    getPipelineRunDataResourceProgressCount(
        pipelineId: string,
    ): Promise<number>;

    getDataResourceProcessingStates(
        dataResourceIds: string[],
    ): Promise<DataResourceProcessingState[] | null>;

    getPipelineStepAndStateDataResources(
        pipelineId: string,
        step: PipelineStep,
        state?: PipelineStepState,
        pagination?: PaginationInput,
    ): Promise<PaginationOutput<DataResourceProgress>>;
};
