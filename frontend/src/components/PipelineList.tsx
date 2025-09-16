import { useMutation, useQuery } from "@apollo/client/react";
import { CANCEL_PIPELINE, GET_ALL_PIPELINES } from "../graphql/pipelines";

export function PipelineList() {
    const { data: pipelinesData } = useQuery(GET_ALL_PIPELINES);

    const [
        cancelPipeline,
        {
            data: cancelPipelineData,
            loading: cancelPipelineLoading,
            error: cancelPipelineError,
        },
    ] = useMutation(
        CANCEL_PIPELINE,
    );
    return (
        <ul>
            {pipelinesData?.pipelines.map((pipeline) => (
                <li key={pipeline.id}>
                    <div>Pipeline ID: {pipeline.id}</div>
                    <div>Pipeline Status: {pipeline.status}</div>
                    <div>Started At: {pipeline.startedAt}</div>
                    <div>Stopped At: {pipeline.stoppedAt}</div>
                    <div>
                        <a href={`/pipeline/${pipeline.id}`}>Details</a>
                    </div>
                    {pipeline.status === "RUNNING" && (
                        <button
                            className="btn btn-danger"
                            onClick={() => {
                                cancelPipeline({
                                    variables: { input: { id: pipeline.id } },
                                });
                            }}
                            disabled={cancelPipelineLoading}
                        >
                            {cancelPipelineLoading ? "Cancelling..." : "Cancel"}
                        </button>
                    )}
                </li>
            ))}
        </ul>
    );
}
