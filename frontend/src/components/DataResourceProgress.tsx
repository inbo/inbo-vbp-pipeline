import { useQuery } from "@apollo/client/react";
import { GET_PIPELINE_DATA_RESOURCE_PROGRESS } from "../graphql/pipelines";
import type {
    PipelineStep,
    PipelineStepState,
} from "../__generated__/biocache-index-management/graphql";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import { Spinner } from "./Spinner";
import { Link } from "react-router";
import { ErrorDetails } from "./PipelineDataResourceDetails";

export type DataResourceFilter = {
    step?: PipelineStep;
    state?: PipelineStepState;
};

export function DataResourceProgress(
    { pipelineId, step, state, setDataResourceFilter }: {
        pipelineId: string;
        step: PipelineStep;
        state?: PipelineStepState;
        setDataResourceFilter: Dispatch<SetStateAction<DataResourceFilter>>;
    },
) {
    const { loading, error, data, fetchMore } = useQuery(
        GET_PIPELINE_DATA_RESOURCE_PROGRESS,
        {
            variables: { step, state, id: pipelineId, first: 10, after: null },
        },
    );

    const dataResources =
        data?.pipeline?.dataResourceProgress?.edges?.map((edge) =>
            edge?.node
        ) ||
        [];

    return (
        <div>
            <p>{pipelineId}{step} {state}</p>
            {error && <li>Error: {error.message}</li>}
            <ul>
                {dataResources.map((
                    progress: any,
                ) => (
                    <li key={progress.dataResource.id}>
                        <Link
                            to={`/${pipelineId}/${progress.dataResource.id}`}
                        >
                            {progress.dataResource.name}: {progress.state}
                        </Link>
                        {progress.error && ErrorDetails(progress.cause)}
                    </li>
                ))}

                {loading
                    ? <Spinner />
                    : data?.pipeline?.dataResourceProgress?.pageInfo
                        ?.hasNextPage &&
                        (
                            <button
                                onClick={() => {
                                    fetchMore({
                                        variables: {
                                            after: data.pipeline
                                                ?.dataResourceProgress
                                                ?.pageInfo
                                                .endCursor,
                                        },
                                    });
                                }}
                            >
                                Load More
                            </button>
                        )}
            </ul>
        </div>
    );
}
