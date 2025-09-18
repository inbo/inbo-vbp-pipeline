import {
    DataResourceProgressResolvers,
    DataResourceProgressState,
    MutationResolvers,
    PipelineResolvers,
    QueryResolvers,
} from "../__generated__/types";
import { AwsPipelineServiceImpl } from "../aws/aws-pipeline-service";
import config from "../config";
import { dataResourceService } from "./data-resource-resolver";

const pipelineService = new AwsPipelineServiceImpl(config);

export const Query: QueryResolvers = {
    pipeline: async (_, { id }) => {
        return pipelineService.getPipeline(id);
    },
    pipelines: async () => {
        return pipelineService.getPipelines();
    },
    dataResourceHistory: async (_, { input: { dataResourceId } }) => {
        const events = await pipelineService.getDataResourceHistory(
            dataResourceId,
        );
        return {
            events: events.map((event) => {
                return {
                    dataResourceId: event.dataResourceId,
                    rootPipelineId: event.rootPipelineId,
                    executionId: event.executionId,
                    event: event.event,
                    timestamp: event.timestamp.toISOString(),
                    lastUpdated: event.lastUpdated.toISOString(),
                };
            }),
        };
    },
};

export const Mutation: MutationResolvers = {
    startPipeline: async (
        _,
        { input: { dataResourceIds, solrCollection } },
    ) => {
        const pipeline = await pipelineService.startPipeline(
            dataResourceIds,
            solrCollection ? solrCollection : undefined,
        );
        return {
            pipeline,
        };
    },
    cancelPipeline: async (_, { input: { id } }) => {
        await pipelineService.cancelPipeline(id);
        const pipeline = await pipelineService.getPipeline(id);
        return {
            pipeline: pipeline!,
        };
    },
};

export const PipelineQuery: PipelineResolvers = {
    dataResourceProgress: async (parent) => {
        return (await pipelineService.getPipelineRunDataResourceProgress(
            parent.id,
        )).map((progress) => ({
            dataResource: { id: progress.dataResourceId },
            state: progress.state as DataResourceProgressState,
            startedAt: progress.startedAt?.toISOString(),
            stoppedAt: progress.stoppedAt?.toISOString(),
        }));
    },
};

export const DataResourceProgressQuery: DataResourceProgressResolvers = {
    dataResource: async (parent) => {
        return dataResourceService.getDataResource(parent.dataResource!.id);
    },
};

export default {
    Query: Query,
    Mutation: Mutation,
    Pipeline: PipelineQuery,
    DataResourceProgress: DataResourceProgressQuery,
};
