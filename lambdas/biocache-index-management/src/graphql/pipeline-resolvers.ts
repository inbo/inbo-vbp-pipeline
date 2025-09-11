import { MutationResolvers, QueryResolvers } from "../__generated__/types";
import { AwsPipelineServiceImpl } from "../aws/aws-pipeline-service";
import config from "../config";

const pipelineService = new AwsPipelineServiceImpl(config);

export const PipelineQuery: QueryResolvers = {
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

export const PipelineMutation: MutationResolvers = {
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
