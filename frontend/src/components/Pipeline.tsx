import "../styles/Pipeline.css";

import { useMutation, useQuery } from "@apollo/client/react";
import { CANCEL_PIPELINE, GET_PIPELINE_PROGRESS } from "../graphql/pipelines";
import { useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
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
import { Button, Icon } from "@mui/material";
import { PipelineProgress } from "./PipelineProgress";
import RefreshIcon from "@mui/icons-material/Refresh";

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

    const {
        data,
        loading,
        error,
        networkStatus,
        startPolling,
        stopPolling,
        refetch,
    } = useQuery(
        GET_PIPELINE_PROGRESS,
        {
            variables: { id: pipelineId! },
        },
    );
    const [dataResourceFilter, setDataResourceFilter] = useState<
        DataResourceFilter
    >({});

    const stats = data?.pipeline?.stats;

    useEffect(() => {
        if (data?.pipeline?.status === PipelineStatus.Running) {
            startPolling(10_000);
        }
        return () => {
            stopPolling();
        };
    }, [data?.pipeline?.status]);

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

    const dataResourcesCount = stats?.steps.find((step) =>
        step.step === dataResourceFilter.step
    )?.[
        (dataResourceFilter.state?.toLowerCase() ||
            "total") as keyof typeof stats.steps[0]
    ];
    const dataResources = useMemo(
        () => {
            return dataResourceFilter.step && (
                <>
                    <h4>
                        Data Resources in {dataResourceFilter.step}{" "}
                        {dataResourceFilter.state
                            ? `with state ${dataResourceFilter.state}`
                            : ""}
                        {dataResourcesCount && (
                            <span className="pipeline-step-data-resources-count">
                                {dataResourcesCount}
                            </span>
                        )}
                    </h4>
                    {dataResourceFilter.step
                        ? (
                            <DataResourceProgress
                                pipelineId={pipelineId}
                                step={dataResourceFilter.step}
                                state={dataResourceFilter.state}
                                setDataResourceFilter={setDataResourceFilter}
                            />
                        )
                        : null}
                </>
            );
        },
        [
            pipelineId,
            dataResourceFilter,
            dataResourceFilter.step
                ? stats?.steps[dataResourceFilter.step as any]
                : null,
            setDataResourceFilter,
            dataResourcesCount,
        ],
    );

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    if (
        loading && networkStatus !== NetworkStatus.poll &&
        networkStatus !== NetworkStatus.refetch
    ) {
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
                <div className="pipeline-actions">
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
                    {data.pipeline.status === PipelineStatus.Running && (
                        <Button
                            onClick={() => refetch()}
                            disabled={loading}
                        >
                            <RefreshIcon />
                        </Button>
                    )}
                    <Button
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        {showDetails ? "Hide Details" : "Show Details"}
                    </Button>
                    {data?.pipeline?.status == PipelineStatus.Running && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setShowConfirmCancel(true)}
                        >
                            Cancel
                            {showConfirmCancel && (
                                <ActionConfirmationModal
                                    title="Confirm Cancel Pipeline"
                                    message="Are you sure you want to cancel this pipeline?"
                                    actionLabel={cancelPipelineLoading
                                        ? "Cancelling..."
                                        : "Confirm"}
                                    onConfirm={async () => {
                                        await cancelPipeline({
                                            variables: {
                                                input: { id: pipelineId },
                                            },
                                        });
                                        setShowConfirmCancel(false);
                                    }}
                                    onCancel={() => setShowConfirmCancel(false)}
                                />
                            )}
                        </Button>
                    )}
                </div>

                {showDetails &&
                    (
                        <div>
                            Input:{" "}
                            <pre>{JSON.stringify(JSON.parse(data?.pipeline?.input!)!, null, 2)}</pre>
                            {data?.pipeline?.status ==
                                    PipelineStatus.Succeeded && (
                                <div>
                                    Output:{" "}
                                    <pre>{JSON.stringify(JSON.parse(data?.pipeline?.output!)!, null, 2)}</pre>
                                </div>
                            )}

                            <div>
                                Started At: {data?.pipeline?.startedAt}
                            </div>
                            {data.pipeline?.stoppedAt && (
                                <div>
                                    Stopped At: {data?.pipeline?.stoppedAt}
                                </div>
                            )}
                        </div>
                    )}
            </div>
            <div className="pipeline-step-data-resources">
                {dataResources}
            </div>
        </div>
    );
};

export default Pipeline;
