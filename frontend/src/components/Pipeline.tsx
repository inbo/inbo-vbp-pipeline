import "../styles/Pipeline.css";

import { useMutation, useQuery } from "@apollo/client/react";
import { CANCEL_PIPELINE, GET_PIPELINE_PROGRESS } from "../graphql/pipelines";
import { useNavigate, useParams } from "react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    PipelineStatus,
    type StartPipelineInput,
} from "../__generated__/biocache-index-management/graphql";

import "../styles/PipelineProgress.css";
import {
    type DataResourceFilter,
    DataResourceProgress,
} from "./DataResourceProgress";
import { Spinner } from "./Spinner";
import { ActionConfirmationModal } from "./ActionConfirmationModal";
import { Button } from "@mui/material";
import { PipelineProgress } from "./PipelineProgress";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DifferenceIcon from "@mui/icons-material/Difference";
import { Close } from "@mui/icons-material";
import { settings } from "../settings";
import { PipelineHeader } from "./PipelineHeader";

export const Pipeline = (
    { id, showHeader = true }: { id?: string; showHeader?: boolean },
) => {
    const navigate = useNavigate();
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
                    <h4 className="pipeline-step-data-resources-header">
                        <span>
                            Data Resources in {dataResourceFilter.step}{" "}
                            {dataResourceFilter.state
                                ? `with state ${dataResourceFilter.state}`
                                : ""}
                            {dataResourcesCount && (
                                <span className="pipeline-step-data-resources-header-count">
                                    {dataResourcesCount}
                                </span>
                            )}
                        </span>
                        <Button
                            className="pipeline-step-data-resources-header-close"
                            onClick={() => setDataResourceFilter({})}
                        >
                            <Close />
                        </Button>
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

    const copyPipeline = useCallback((onlyFailed: boolean) => {
        type PipelineInput = {
            dataResources?: string[];
            forceDownload?: boolean;
            forceIndex?: boolean;
            forceSample?: boolean;
            forceSolr?: boolean;
            resetAllData?: boolean;
            solrCollection?: string;
            switchIndex?: boolean;
        };
        type PipelineCause = {
            dataResourceId: string;
            state?: string;
            Error?: string;
            Cause?: string;
        }[];
        try {
            const params = new URLSearchParams();

            const input = JSON.parse(
                data?.pipeline?.input || "{}",
            ) as PipelineInput;

            if (input.solrCollection) {
                params.append("index", input.solrCollection);
            }
            if (input.resetAllData !== undefined) {
                params.append("reset-all-data", String(input.resetAllData));
            }
            if (input.forceDownload !== undefined) {
                params.append("force-download", String(input.forceDownload));
            }
            if (input.forceIndex !== undefined) {
                params.append("force-index", String(input.forceIndex));
            }
            if (input.forceSample !== undefined) {
                params.append("force-sample", String(input.forceSample));
            }
            if (input.forceSolr !== undefined) {
                params.append("force-solr", String(input.forceSolr));
            }
            if (input.switchIndex !== undefined) {
                params.append("switch-index", String(input.switchIndex));
            }

            if (onlyFailed) {
                const cause = JSON.parse(
                    data?.pipeline?.cause || "{}",
                ) as PipelineCause;
                cause
                    .filter(({ Error }) => Error !== undefined)
                    .map(({ dataResourceId }) => dataResourceId).forEach((id) =>
                        params.append("dr", id)
                    );
            } else {
                input.dataResources?.forEach((id) => params.append("dr", id));
            }

            navigate(`/start?${params.toString()}`);
        } catch (e) {
            console.error("Error copying pipeline:", e);
        }
    }, [navigate, data?.pipeline?.input, data?.pipeline?.output]);

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    if (
        loading && data === undefined
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
                {showHeader && (
                    <div className="pipeline-header-container">
                        <PipelineHeader pipeline={data.pipeline} />
                        {data.pipeline.status === PipelineStatus.Running
                            ? (
                                <Button
                                    onClick={() => refetch()}
                                    disabled={loading}
                                >
                                    <RefreshIcon />
                                </Button>
                            )
                            : (
                                <Button
                                    onClick={() => copyPipeline(false)}
                                    disabled={loading}
                                >
                                    <ContentCopyIcon />
                                </Button>
                            )}
                        {data.pipeline.status === PipelineStatus.Failed &&
                            data.pipeline.error ===
                                "SomeDataResourceProcessingFailed" &&
                            (
                                <Button
                                    onClick={() => copyPipeline(true)}
                                    disabled={loading}
                                >
                                    <DifferenceIcon />
                                </Button>
                            )}
                    </div>
                )}
                <div className="pipeline-progress">
                    {progress}
                </div>
                <div className="pipeline-actions">
                    <Button
                        href={`${settings.logsUrl}?refresh=1m&from=${data.pipeline.startedAt}&to=${
                            data.pipeline.stoppedAt ?? "now"
                        }`}
                        target="_blank"
                    >
                        Logs
                    </Button>
                    <Button
                        href={`https://eu-west-1.console.aws.amazon.com/states/home?region=eu-west-1#/v2/executions/details/${data.pipeline.executionArn}`}
                        target="_blank"
                    >
                        AWS Console
                    </Button>
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
                        </Button>
                    )}
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
                </div>
                {data?.pipeline?.status == PipelineStatus.Failed && (
                    <div className="pipeline-error">
                        <div>
                            Error: <pre>{data?.pipeline?.error}</pre>
                        </div>
                        <div>
                            Cause: <pre>{data?.pipeline?.cause}</pre>
                        </div>
                    </div>
                )}
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
            {dataResourceFilter.step !== undefined && (
                <div className="pipeline-step-data-resources">
                    {dataResources}
                </div>
            )}
        </div>
    );
};

export default Pipeline;
