import {
    DataResourceProgressConnectionResolvers,
    MutationResolvers,
    Pipeline as GqlPipeline,
    PipelineResolvers,
    PipelineStatus as GqlPipelineStatus,
    PipelineStep as GqlPipelineStep,
    PipelineStepState as GqlPipelineStepState,
    QueryResolvers,
} from "../__generated__/types";
import { AwsPipelineServiceImpl } from "../aws/aws-pipeline-service";
import config from "../config";
import {
    Pipeline,
    PipelineStatus,
    PipelineStep,
    PipelineSteps,
    PipelineStepState,
} from "../core/pipeline-service";

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
    stats: async (parent) => {
        const stats = await pipelineService.getPipelineStats(
            parent.id,
        );
        return {
            total: stats.total,
            steps: PipelineSteps.map((step) => ({
                step: step as GqlPipelineStep,
                ...stats.steps[step],
            })),
        };
    },
    dataResourceProgress: async (
        parent,
        { step, state, first, after, last, before },
    ) => {
        const dataResourceProgress = await pipelineService
            .getPipelineStepAndStateDataResources(
                parent.id,
                step as PipelineStep,
                state as PipelineStepState,
                {
                    first: first ?? undefined,
                    after: after ?? undefined,
                    last: last ?? undefined,
                    before: before ?? undefined,
                },
            );

        return {
            edges: dataResourceProgress.edges.map((progress) => ({
                cursor: progress.cursor,
                node: {
                    dataResource: { id: progress.node.dataResourceId },
                    step: step as GqlPipelineStep,
                    state: progress.node.state as GqlPipelineStepState,
                },
            })),
            pageInfo: dataResourceProgress.pageInfo,
        };
    },
};

export const DataResourceProgressConnection:
    DataResourceProgressConnectionResolvers = {
        totalCount: async (parent, _args, _contextValue, info) => {
            return pipelineService.getPipelineRunDataResourceProgressCount(
                info.variableValues.id as string,
            );
        },
    };

export default {
    Query: Query,
    Mutation: Mutation,
    Pipeline: PipelineQuery,
    DataResourceProgressConnection: DataResourceProgressConnection,
};

function maptoGraphql(pipeline: Pipeline): GqlPipeline {
    return {
        id: pipeline.id,
        status: pipeline.status as GqlPipelineStatus,
        startedAt: pipeline.startedAt?.toISOString(),
        stoppedAt: pipeline.stoppedAt?.toISOString(),
        input: pipeline.input,
        output: pipeline.output,
        error: pipeline.error,
        cause: pipeline.cause,
    };
}
