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
export type PipelineStepState = "SUCCEEDED" | "FAILED" | "QUEUED" | "RUNNING";

export type PipelineStepProgress = {
    queued: number;
    running: number;
    completed: number;
    failed: number;
};

export type PipelineProgress = {
    total: number;
    completed: number;
    failed: number;
    dataResourceProgress: DataResourceProgress[];
    stepProgress: { [step in PipelineStep]: PipelineStepProgress };
};

export type DataResourceProgress = {
    dataResourceId: string;
    state: PipelineStepState;
    step: PipelineStep;
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

    getPipelineProgress(
        pipelineId: string,
    ): Promise<PipelineProgress>;
};
