import {
    DataResourceProgressResolvers,
    DataResourceProgressState,
    DataResourceProgressStep,
    MutationResolvers,
    Pipeline as GqlPipeline,
    PipelineResolvers,
    PipelineStatus as GqlPipelineStatus,
    QueryResolvers,
} from "../__generated__/types";
import { AwsPipelineServiceImpl } from "../aws/aws-pipeline-service";
import config from "../config";
import { Pipeline, PipelineStatus } from "../core/pipeline-service";
import { dataResourceService } from "./data-resource-resolver";

const pipelineService = new AwsPipelineServiceImpl(config);

export const Query: QueryResolvers = {
    pipeline: async (_, { id }) => {
        const result = await pipelineService.getPipeline(id);
        return result && maptoGraphql(result);
    },
    pipelines: async (_, { status }) => {
        return (await pipelineService.getPipelines(
            status as PipelineStatus | undefined,
        ))
            .map(maptoGraphql);
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
            pipeline: maptoGraphql(pipeline),
        };
    },
    cancelPipeline: async (_, { input: { id } }) => {
        await pipelineService.cancelPipeline(id);
        const pipeline = await pipelineService.getPipeline(id);
        return {
            pipeline: maptoGraphql(pipeline!),
        };
    },
};

export const PipelineQuery: PipelineResolvers = {
    progress: async (parent) => {
        const progress = await pipelineService.getPipelineProgress(
            parent.id,
        );
        return {
            total: progress.total,
            completed: progress.completed,
            failed: progress.failed,

            stepProgress: Object.entries(progress.stepProgress).map((
                [step, progress],
            ) => ({
                step: step as DataResourceProgressStep,
                queued: progress.queued,
                running: progress.running,
                completed: progress.completed,
                failed: progress.failed,
            })),
            dataResourceProgress: progress.dataResourceProgress.map(
                (drp) => ({
                    dataResource: { id: drp.dataResourceId },
                    state: drp.state as DataResourceProgressState,
                    step: drp.step as DataResourceProgressStep,
                    startedAt: drp.startedAt?.toISOString(),
                    stoppedAt: drp.stoppedAt?.toISOString(),
                }),
            ),
        };
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

function maptoGraphql(pipeline: Pipeline): GqlPipeline {
    return {
        id: pipeline.id,
        status: pipeline.status as GqlPipelineStatus,
        startedAt: pipeline.startedAt?.toISOString(),
        stoppedAt: pipeline.stoppedAt?.toISOString(),
    };
}
