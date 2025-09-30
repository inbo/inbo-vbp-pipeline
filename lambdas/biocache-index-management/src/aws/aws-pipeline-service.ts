import {
    DataResourceHistory,
    DataResourceProcessingState,
    DataResourceProgress,
    Pipeline,
    PipelineDetails,
    PipelineService,
    PipelineStats,
    PipelineStatus,
    PipelineStep,
    PipelineSteps,
    PipelineStepState,
    PipelineStepStats,
} from "../core/pipeline-service";

import { SFN } from "@aws-sdk/client-sfn";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { PaginationInput, PaginationOutput } from "../core/common";

export class AwsPipelineServiceImpl implements PipelineService {
    private readonly awsStateMachineArn: string;
    private readonly awsStateExecutionArnPrefix: string;
    private readonly awsDynamoDBTableName: string;
    private readonly sfn: SFN;
    private readonly dynamoDB: DynamoDB;

    constructor(
        { awsStateMachineArn, awsDynamoDBTableName, awsBaseUrl }: {
            awsStateMachineArn: string;
            awsDynamoDBTableName: string;
            awsBaseUrl: string | undefined;
        },
    ) {
        this.awsStateMachineArn = awsStateMachineArn;
        this.awsStateExecutionArnPrefix = awsStateMachineArn.replace(
            "stateMachine",
            "execution",
        );
        this.awsDynamoDBTableName = awsDynamoDBTableName;
        this.sfn = new SFN({
            endpoint: awsBaseUrl,
        });
        this.dynamoDB = new DynamoDB({
            endpoint: awsBaseUrl,
        });
    }

    async getPipeline(id: string): Promise<PipelineDetails | null> {
        console.debug("Getting pipeline with id:", id);

        const output = await this.sfn.describeExecution({
            executionArn: `${this.awsStateExecutionArnPrefix}:${id}`,
            includedData: "ALL_DATA",
        });

        return output.executionArn
            ? {
                id: output.name!,
                executionArn: output.executionArn!,
                status: output.status! as PipelineStatus,
                startedAt: output.startDate,
                stoppedAt: output.stopDate,
                input: output.input,
                output: output.output,
                error: output.error,
                cause: output.cause,
            }
            : null;
    }

    async getPipelines(status?: PipelineStatus): Promise<Pipeline[]> {
        console.debug("Getting all pipelines");

        const output = await this.sfn.listExecutions({
            stateMachineArn: this.awsStateMachineArn,
            maxResults: 10,
            statusFilter: status,
        });
        return output.executions
            ?.map((execution) => ({
                id: execution.name!,
                executionArn: execution.executionArn!,
                status: execution.status! as PipelineStatus,
                startedAt: execution.startDate,
                stoppedAt: execution.stopDate,
            })) || [];
    }
    async startPipeline(
        dataResourceIds?: string[],
        solrCollection?: string,
        resetAllData: boolean = false,
        forceDownload: boolean = false,
        forceIndex: boolean = false,
        forceSample: boolean = false,
        forceSolr: boolean = false,
    ): Promise<Pipeline> {
        console.debug(
            "Starting pipeline with input:",
            dataResourceIds,
            resetAllData,
            solrCollection,
            forceDownload,
            forceIndex,
            forceSample,
            forceSolr,
        );

        const output = await this.sfn.startExecution({
            stateMachineArn: this.awsStateMachineArn,
            input: JSON.stringify({
                dataResources: dataResourceIds,
                solrCollection,
                resetAllData,
                forceDownload,
                forceIndex,
                forceSample,
                forceSolr,
            }),
        });
        return {
            id: output.executionArn!.replace(
                `${this.awsStateExecutionArnPrefix}:`,
                "",
            ),
            executionArn: output.executionArn!,
            status: PipelineStatus.Running,
            startedAt: output.startDate,
        };
    }

    async cancelPipeline(id: string): Promise<void> {
        console.debug("Cancelling pipeline with id:", id);

        const output = await this.sfn.stopExecution({
            executionArn: `${this.awsStateExecutionArnPrefix}:${id}`,
        });
    }

    async getDataResourceHistory(
        dataResourceId: string,
    ): Promise<DataResourceHistory[]> {
        console.debug("Getting data resource history for id:", dataResourceId);

        const output = await this.dynamoDB.query({
            TableName: this.awsDynamoDBTableName,
            KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": { S: `DATA_RESOURCE#${dataResourceId}` },
                ":sk": { S: "HISTORY#" },
            },
        });

        return output.Items?.map((item) => ({
            dataResourceId: item.DataResourceId?.S || "empty",
            rootPipelineId: item.RootPipelineId?.S || "empty",
            executionId: item.ExecutionId?.S || "empty",
            event: item.Event?.S || "empty",
            timestamp: new Date(item.timestamp?.S || "1970-01-01"),
            lastUpdated: new Date(item.lastUpdated?.S || "1970-01-01"),
        })) || [];
    }

    async getPipelineStats(
        pipelineId: string,
    ): Promise<PipelineStats> {
        console.debug(
            "Getting data resource progress for pipeline id:",
            pipelineId,
        );

        const statsItems = await this.dynamoDB.batchGetItem({
            RequestItems: {
                [this.awsDynamoDBTableName]: {
                    Keys: [
                        ...PipelineSteps.map((step) => ({
                            PK: { S: `RUN#${pipelineId}` },
                            SK: { S: `STATS#${step}` },
                        })),
                    ],
                },
            },
        });

        const result = {
            total: {
                total: 0,
                queued: 0,
                running: 0,
                succeeded: 0,
                failed: 0,
                skipped: 0,
            },
            steps: PipelineSteps.reduce((acc, step) => {
                acc[step] = {
                    total: 0,
                    queued: 0,
                    running: 0,
                    succeeded: 0,
                    failed: 0,
                    skipped: 0,
                };
                return acc;
            }, {} as { [step in PipelineStep]: PipelineStepStats }),
        };

        statsItems.Responses?.[this.awsDynamoDBTableName].forEach((item) => {
            const step = item.SK.S!.replace("STATS#", "") as PipelineStep;
            result.steps[step] = {
                queued: item.Queued?.N ? parseInt(item.Queued.N) : 0,
                running: item.Running?.N ? parseInt(item.Running.N) : 0,
                succeeded: item.Succeeded?.N ? parseInt(item.Succeeded.N) : 0,
                skipped: item.Skipped?.N ? parseInt(item.Skipped.N) : 0,
                failed: item.Failed?.N ? parseInt(item.Failed.N) : 0,
            } as PipelineStepStats;

            result.steps[step].total = result.steps[step].succeeded +
                result.steps[step].skipped +
                result.steps[step].failed +
                result.steps[step].running +
                result.steps[step].queued;
            result.total.running = (result.total.running || 0) +
                result.steps[step].running;
            result.total.queued = (result.total.queued || 0) +
                result.steps[step].queued;
            result.total.failed = (result.total.failed || 0) +
                result.steps[step].failed;
        });

        result.total.total = result.steps.DOWNLOAD.total;
        result.total.succeeded = result.steps.SOLR?.succeeded;
        result.total.skipped = result.steps.SOLR?.skipped;

        return result;
    }

    async getPipelineStepAndStateDataResources(
        pipelineId: string,
        step: PipelineStep,
        state?: PipelineStepState,
        pagination?: PaginationInput,
    ): Promise<PaginationOutput<DataResourceProgress>> {
        console.debug(
            "Getting data resource progress for pipeline id:",
            pipelineId,
        );

        const baseQuery = {
            TableName: this.awsDynamoDBTableName,
            KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
            ExpressionAttributeNames: {
                "#pk": "PK",
                "#sk": "SK",
            },
            ExpressionAttributeValues: {
                ":pk": { S: `RUN#${pipelineId}` },
                ":sk": { S: `DATA_RESOURCE#${step}#${state ? state : ""}` },
            },
        };

        const output = await this.dynamoDB.query({
            ...baseQuery,
            Limit: (!pagination?.first && !pagination?.last)
                ? 10
                : Math.min(pagination?.first || 100, pagination?.last || 100),
            ExclusiveStartKey: pagination?.after
                ? {
                    PK: { S: `RUN#${pipelineId}` },
                    SK: { S: pagination.after },
                }
                : pagination?.before
                ? {
                    PK: { S: `RUN#${pipelineId}` },
                    SK: { S: pagination.before },
                }
                : undefined,
            ScanIndexForward: pagination?.after
                ? true
                : pagination?.before
                ? false
                : true,
        });

        return {
            edges: output.Items?.map((item) => ({
                cursor: item.SK.S!,
                node: {
                    dataResourceId: item.DataResourceId.S!,
                    step: item.Step.S! as PipelineStep,
                    state: item.State.S! as PipelineStepState,
                    timestamp: new Date(item.Timestamp.S!),
                    error: item.Error?.S,
                    cause: item.Cause?.S,
                },
            })) || [],
            pageInfo: {
                hasNextPage: !!output.LastEvaluatedKey,
                hasPreviousPage: false, // DynamoDB does not support backwards pagination
                startCursor: output.Items && output.Items.length > 0
                    ? output.Items[0].SK.S!
                    : undefined,
                endCursor: output.Items && output.Items.length > 0
                    ? output.Items[output.Items.length - 1].SK.S!
                    : undefined,
            },
        };
    }

    async getPipelineRunDataResourceProgressCount(
        pipelineId: string,
    ): Promise<number> {
        console.debug(
            "Getting data resource progress counts for pipeline id:",
            pipelineId,
        );

        const counts = await this.dynamoDB.query({
            TableName: this.awsDynamoDBTableName,
            KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": { S: `RUN#${pipelineId}` },
                ":sk": { S: "DATA_RESOURCE#" },
            },
            Select: "COUNT",
        });

        return counts.Count || 0;
    }

    async getDataResourceProcessingStates(
        dataResourceIds: string[],
    ): Promise<DataResourceProcessingState[] | null> {
        console.debug(
            "Getting data resource processing state for data resource ids:",
            dataResourceIds,
        );

        const response = await this.dynamoDB.batchGetItem({
            RequestItems: {
                [this.awsDynamoDBTableName]: {
                    Keys: dataResourceIds.map((id) => ({
                        PK: { S: `DATA_RESOURCE#${id}` },
                        SK: { S: "STATE#" },
                    })),
                },
            },
        });

        return response.Responses?.[this.awsDynamoDBTableName].map((
            item,
        ) => ({
            dataResourceId: item.DataResourceId.S,
            downloadedAt: item.DownloadedAt?.S,
            indexedAt: item.IndexedAt?.S,
            sampledAt: item.SampledAt?.S,
            uploadedAt: item.UploadedAt?.S,
            uploadedTo: item.UploadedTo?.SS,
        })) || null;
    }
}
