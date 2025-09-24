import { useQuery } from "@apollo/client/react";
import { GET_PIPELINE_DATA_RESOURCE_PROGRESS } from "../graphql/pipelines";

export function DataResourceProgress({ pipelineId }: { pipelineId: string }) {
    const { loading, error, data, fetchMore } = useQuery(
        GET_PIPELINE_DATA_RESOURCE_PROGRESS,
        {
            variables: { id: pipelineId, first: 10, after: null },
        },
    );

    return (
        <ul>
            {data?.pipeline?.dataResourceProgress?.dataResourceProgress?.map((
                progress: any,
            ) => (
                <li key={progress.dataResource.id}>
                    {progress.dataResource.name}: {progress.state}
                </li>
            ))}
            {data?.pipeline?.dataResourceProgress?.pageInfo?.hasNextPage && (
                <button
                    onClick={() => {
                        fetchMore({
                            variables: {
                                after: data.pipeline?.dataResourceProgress
                                    ?.pageInfo
                                    .endCursor,
                            },
                        });
                    }}
                >
                    Load More
                </button>
            )}
            {loading && <li>Loading...</li>}
            {error && <li>Error: {error.message}</li>}
        </ul>
    );
}
