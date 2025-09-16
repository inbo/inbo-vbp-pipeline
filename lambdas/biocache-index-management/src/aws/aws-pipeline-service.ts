import {
    DataResourceHistory,
    Pipeline,
    PipelineDetails,
    PipelineService,
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
                status: output.status!,
                startedAt: output.startDate,
                stoppedAt: output.stopDate,
                input: output.input,
                output: output.output,
                error: output.error,
                cause: output.cause,
            }
            : null;
    }
    async getPipelines(): Promise<Pipeline[]> {
        console.debug("Getting all pipelines");

        const output = await this.sfn.listExecutions({
            stateMachineArn: this.awsStateMachineArn,
            maxResults: 10,
        });
        return output.executions
            ?.map((execution) => ({
                id: execution.name!,
                status: execution.status!,
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
            status: "RUNNING",
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
}
