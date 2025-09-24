import { useQuery } from "@apollo/client/react";
import { GET_PIPELINE_PROGRESS } from "../graphql/pipelines";

export function DataResourceProgress({ pipelineId }: { pipelineId: string }) {
    const { loading, error, data } = useQuery(
        GET_PIPELINE_PROGRESS,
        {
            variables: { id: pipelineId },
        },
    );

    return (
        <div>
            <ul>
                {data?.pipeline?.progress?.dataResourceProgress?.map((
                    progress: any,
                ) => (
                    <li key={progress.dataResource.id}>
                        {progress.dataResource.name}: {progress.state}
                    </li>
                ))}
                {loading && <li>Loading...</li>}
                {error && <li>Error: {error.message}</li>}
            </ul>
        </div>
    );
}
