import "../styles/Pipeline.css";

import { useMutation, useQuery } from "@apollo/client/react";
import { CANCEL_PIPELINE, GET_PIPELINE_PROGRESS } from "../graphql/pipelines";
import { useParams } from "react-router";
import { useMemo, useState } from "react";
import {
    PipelineStatus,
} from "../__generated__/biocache-index-management/graphql";

import "../styles/PipelineProgress.css";
import { NetworkStatus } from "@apollo/client";
import {
    type DataResourceFilter,
    DataResourceProgress,
} from "./DataResourceProgress";
import { Spinner } from "./Spinner";
import { ActionConfirmationModal } from "./ActionConfirmationModal";
import { Button } from "@mui/material";
import { PipelineProgress } from "./PipelineProgress";

export const Pipeline = ({ id }: { id?: string }) => {
    const pipelineId = id ?? useParams().id!;

    const [
        cancelPipeline,
        {
            loading: cancelPipelineLoading,
            error: cancelPipelineError,
        },
    ] = useMutation(
        CANCEL_PIPELINE,
    );

    const [showDetails, setShowDetails] = useState(false);
    const [showConfirmCancel, setShowConfirmCancel] = useState(false);

    const { data, loading, error, networkStatus } = useQuery(
        GET_PIPELINE_PROGRESS,
        {
            variables: { id: pipelineId! },
            pollInterval: 10_000,
        },
    );
    const [dataResourceFilter, setDataResourceFilter] = useState<
        DataResourceFilter
    >({});

    const stats = data?.pipeline?.stats;

    const progress = useMemo(() => {
        return stats && (
            <PipelineProgress
                pipelineId={pipelineId}
                stats={stats}
                setDataResourceFilter={setDataResourceFilter}
            />
        );
    }, [
        pipelineId,
        data,
        setDataResourceFilter,
    ]);

    const dataResources = useMemo(() => (
        dataResourceFilter.step
            ? (
                <DataResourceProgress
                    pipelineId={pipelineId}
                    step={dataResourceFilter.step}
                    state={dataResourceFilter.state}
                    setDataResourceFilter={setDataResourceFilter}
                />
            )
            : null
    ), [
        pipelineId,
        dataResourceFilter,
        dataResourceFilter.step
            ? stats?.steps[dataResourceFilter.step as any]
            : null,
        setDataResourceFilter,
    ]);

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    if (loading && networkStatus !== NetworkStatus.poll) {
        return <Spinner />;
    }

    if (!data?.pipeline) {
        return <p>Not found</p>;
    }

    if (cancelPipelineError) {
        return <p>Error cancelling pipeline: {cancelPipelineError.message}</p>;
    }

    return (
        <div className="pipeline">
            <div className="pipeline-details">
                <div className="pipeline-header">
                    ID:
                    <a
                        href={`https://eu-west-1.console.aws.amazon.com/states/home?region=eu-west-1#/v2/executions/details/${data.pipeline.executionArn}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {data?.pipeline?.id}
                    </a>
                </div>
                <div className="pipeline-status">
                    Status:{" "}
                    <span
                        className={`pipeline-status-value pipeline-status-value-${data?.pipeline?.status.toLowerCase()}`}
                    >
                        {data?.pipeline?.status}
                    </span>
                </div>
                <div className="pipeline-progress">
                    {progress}
                </div>
                {data?.pipeline?.status == PipelineStatus.Failed && (
                    <div>
                        <div>
                            Error: <pre>{data?.pipeline?.error}</pre>
                        </div>
                        <div>
                            Cause: <pre>{data?.pipeline?.cause}</pre>
                        </div>
                    </div>
                )}
                {data?.pipeline?.status == PipelineStatus.Running && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setShowConfirmCancel(true)}
                    >
                        Cancel Pipeline
                    </Button>
                )}
                {showDetails
                    ? (
                        <div>
                            <div>
                                <Button
                                    onClick={() => setShowDetails(false)}
                                >
                                    Hide Details
                                </Button>
                            </div>
                            Input: <pre>{data?.pipeline?.input}</pre>
                            {data?.pipeline?.status ==
                                    PipelineStatus.Succeeded && (
                                <div>
                                    Output: <pre>{data?.pipeline?.output}</pre>
                                </div>
                            )}

                            <div>Started At: {data?.pipeline?.startedAt}</div>
                            {data.pipeline?.stoppedAt && (
                                <div>
                                    Stopped At: {data?.pipeline?.stoppedAt}
                                </div>
                            )}
                        </div>
                    )
                    : (
                        <Button
                            onClick={() => setShowDetails(true)}
                        >
                            Show Details
                        </Button>
                    )}
                {showConfirmCancel && (
                    <ActionConfirmationModal
                        title="Confirm Cancel Pipeline"
                        message="Are you sure you want to cancel this pipeline?"
                        actionLabel={cancelPipelineLoading
                            ? "Cancelling..."
                            : "Confirm"}
                        onConfirm={() =>
                            cancelPipeline({
                                variables: { input: { id: pipelineId } },
                            })}
                        onCancel={() => setShowConfirmCancel(false)}
                    />
                )}
            </div>
            <div className="pipeline-step-data-resources">
                {dataResources}
            </div>
        </div>
    );
};

export default Pipeline;
