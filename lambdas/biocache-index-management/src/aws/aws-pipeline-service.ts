import {
    DataResourceHistory,
    DataResourceProgress,
    Pipeline,
    PipelineDetails,
    PipelineProgress,
    PipelineService,
    PipelineStatus,
    PipelineStep,
    PipelineSteps,
    PipelineStepState,
} from "../core/pipeline-service";

import { SFN } from "@aws-sdk/client-sfn";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

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
        });

        return output.executionArn
            ? {
                id: output.name!,
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
                status: execution.status! as PipelineStatus,
                startedAt: execution.startDate,
                stoppedAt: execution.stopDate,
            })) || [];
    }
    async startPipeline(
        dataResourceIds?: string[],
        solrCollection?: string,
    ): Promise<Pipeline> {
        console.debug(
            "Starting pipeline with input:",
            dataResourceIds,
            solrCollection,
        );

        const output = await this.sfn.startExecution({
            stateMachineArn: this.awsStateMachineArn,
            input: JSON.stringify({
                dataResources: dataResourceIds,
                solrCollection,
            }),
        });
        return {
            id: output.executionArn!.replace(
                `${this.awsStateExecutionArnPrefix}:`,
                "",
            ),
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

    async getPipelineProgress(
        pipelineId: string,
    ): Promise<PipelineProgress> {
        console.debug(
            "Getting data resource progress for pipeline id:",
            pipelineId,
        );

        const dataResourceProgressItems = await this.dynamoDB.query({
            TableName: this.awsDynamoDBTableName,
            KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": { S: `RUN#${pipelineId}` },
                ":sk": { S: "DATA_RESOURCE#" },
            },
        });

        const result = {
            total: 0,
            completed: 0,
            failed: 0,

            stepProgress: {
                DOWNLOAD: { queued: 0, running: 0, completed: 0, failed: 0 },
                INDEX: { queued: 0, running: 0, completed: 0, failed: 0 },
                SAMPLE: { queued: 0, running: 0, completed: 0, failed: 0 },
                SOLR: { queued: 0, running: 0, completed: 0, failed: 0 },
            },
        };

        const outputProgress = dataResourceProgressItems.Items?.map((item) => {
            const state = item.State.S!.toUpperCase() as PipelineStepState;
            const step = item.Step.S!.toUpperCase() as PipelineStep;

            if (!(step in result.stepProgress)) {
                throw new Error(`Unknown step: ${step}`);
            }

            result.total++;
            // If we are currently at a certain step, all previous steps are also completed
            PipelineSteps.slice(0, PipelineSteps.indexOf(step)).forEach(
                (s) => result.stepProgress[s].completed++,
            );

            switch (state) {
                case "QUEUED":
                    result.stepProgress[step].queued++;
                    break;
                case "COMPLETED":
                    result.stepProgress[step].running++;
                    break;
                case "SUCCEEDED":
                    result.stepProgress[step].completed++;
                    if (step === "SOLR") {
                        result.completed++;
                    }
                    break;
                case "FAILED":
                    result.stepProgress[step].failed++;
                    result.failed++;
                    break;
                default:
                    throw new Error(`Unknown state: ${state}`);
            }

            return ({
                dataResourceId: item.DataResourceId.S!,
                state: state,
                step: step,
                startedAt: item.startedAt?.S
                    ? new Date(item.startedAt.S)
                    : undefined,
                stoppedAt: item.stoppedAt?.S
                    ? new Date(item.stoppedAt.S)
                    : undefined,
            });
        }) || [];

        return {
            ...result,
            dataResourceProgress: outputProgress,
        };
    }
}
