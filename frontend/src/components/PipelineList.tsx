import { useMutation, useQuery } from "@apollo/client/react";
import { CANCEL_PIPELINE, GET_ALL_PIPELINES } from "../graphql/pipelines";
import { Link } from "react-router";
import { Spinner } from "./Spinner";
import { Button } from "@mui/material";

export function PipelineList() {
    const { data: pipelinesData, loading, error } = useQuery(GET_ALL_PIPELINES);
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

    if (loading) return <Spinner />;
    if (error) return <p>Error loading pipelines: {error.message}</p>;

    return (
        <ul>
            {pipelinesData?.pipelines.map((pipeline) => (
                <li key={pipeline.id}>
                    <div>Pipeline ID: {pipeline.id}</div>
                    <div>Pipeline Status: {pipeline.status}</div>
                    <div>Started At: {pipeline.startedAt}</div>
                    <div>Stopped At: {pipeline.stoppedAt}</div>
                    <div>
                        <Link to={`/${pipeline.id}`}>Details</Link>
                    </div>
                    {pipeline.status === "RUNNING" && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                cancelPipeline({
                                    variables: { input: { id: pipeline.id } },
                                });
                            }}
                            disabled={cancelPipelineLoading}
                        >
                            {cancelPipelineLoading ? "Cancelling..." : "Cancel"}
                        </Button>
                    )}
                </li>
            ))}
        </ul>
    );
}
