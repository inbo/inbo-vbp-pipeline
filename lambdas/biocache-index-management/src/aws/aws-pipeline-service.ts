import {
    DataResourceHistory,
    Pipeline,
    PipelineService,
} from "../core/pipeline-service";

import { SFN } from "@aws-sdk/client-sfn";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

export class AwsPipelineServiceImpl implements PipelineService {
    private readonly awsStateMachineArn: string;
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
        this.awsDynamoDBTableName = awsDynamoDBTableName;
        this.sfn = new SFN({
            endpoint: awsBaseUrl,
        });
        this.dynamoDB = new DynamoDB({
            endpoint: awsBaseUrl,
        });
    }
    async getPipeline(id: string): Promise<Pipeline | null> {
        const output = await this.sfn.describeExecution({
            executionArn: id,
        });
        return output.executionArn
            ? {
                id: output.executionArn,
            }
            : null;
    }
    async getPipelines(): Promise<Pipeline[]> {
        const output = await this.sfn.listExecutions({
            stateMachineArn: this.awsStateMachineArn,
        });
        return output.executions
            ?.map((execution) => ({
                id: execution.executionArn!,
            })) || [];
    }
    async startPipeline(
        dataResourceIds?: string[],
        solrCollection?: string,
    ): Promise<Pipeline> {
        const output = await this.sfn.startExecution({
            stateMachineArn: this.awsStateMachineArn,
            input: JSON.stringify({
                dataResourceIds,
                solrCollection,
            }),
        });
        return {
            id: output.executionArn!,
        };
    }
    async cancelPipeline(id: string): Promise<void> {
        await this.sfn.stopExecution({
            executionArn: id,
        });
    }
    async getDataResourceHistory(
        dataResourceId: string,
    ): Promise<DataResourceHistory[]> {
        const output = await this.dynamoDB.query({
            TableName: this.awsDynamoDBTableName,
            KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": { S: `DATA_RESOURCE#${dataResourceId}` },
                ":sk": { S: "HISTORY#" },
            },
        });

        return output.Items?.map((item) => ({
            id: "meh",
            dataResourceId: item.DataResourceId?.S || "empty",
            pipelineId: item.PipelineId?.S || "empty",
            status: item.Status?.S || "empty",
            timestamp: new Date(item.LastUpdated?.S || "1970-01-01"),
        })) || [];
    }
}
