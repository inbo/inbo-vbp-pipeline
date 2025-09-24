import { useQuery } from "@apollo/client/react";
import { GET_PIPELINE, GET_PIPELINE_PROGRESS } from "../graphql/pipelines";
import { useParams } from "react-router";
import { useState } from "react";
import { DataResourceProgress } from "./DataResourceProgress";
import {
    PipelineStatus,
    type PipelineStepProgress,
} from "../__generated__/biocache-index-management/graphql";

import "../styles/PipelineProgress.css";
import { NetworkStatus } from "@apollo/client";

function ProgressStepSection(
    { value, total, color }: { value: number; total: number; color: string },
) {
    if (value <= 0) {
        return null;
    }
    return (
        <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={total}
            style={{
                display: "flex",
                width: `${(value / total) * 100}%`,
                backgroundColor: color,
            }}
        >
            {value}
        </div>
    );
}

function ProgressStep(
    { progress, pipelineTotal }: {
        progress: PipelineStepProgress;
        pipelineTotal: number;
    },
) {
    const stepTotal = progress.completed + progress.failed + progress.running +
        progress.queued;
    return (
        <div
            id={"progress-step-" + progress.step}
            className="progress-step"
            style={{
                flex: 1,
                maxWidth: "25%",
            }}
        >
            <div>{progress.step}</div>
            <div
                className="progress"
                style={{
                    width: `${(stepTotal / pipelineTotal) * 100}%`,
                }}
            >
                <ProgressStepSection
                    value={progress.skipped}
                    total={stepTotal}
                    color="darkgreen"
                />
                <ProgressStepSection
                    value={progress.completed}
                    total={stepTotal}
                    color="green"
                />
                <ProgressStepSection
                    value={progress.failed}
                    total={stepTotal}
                    color="red"
                />
                <ProgressStepSection
                    value={progress.running}
                    total={stepTotal}
                    color="blue"
                />
                <ProgressStepSection
                    value={progress.queued}
                    total={stepTotal}
                    color="grey"
                />
            </div>
        </div>
    );
}

export const Pipeline = ({ id }: { id: string }) => {
    const pipelineId = id ?? useParams().id;
    const { data, loading, error, networkStatus } = useQuery(
        GET_PIPELINE_PROGRESS,
        {
            variables: { id: pipelineId! },
            pollInterval: 10_000,
        },
    );
    const [showDataResourceProgress, setShowDataResourceProgress] = useState<
        boolean
    >(false);

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    if (loading && networkStatus !== NetworkStatus.poll) {
        return <p>Loading...</p>;
    }

    if (!data?.pipeline) {
        return <p>Not found</p>;
    }

    const progress = data?.pipeline?.progress;

    return (
        <div>
            <p>ID: {data?.pipeline?.id}</p>
            <p>Status: {data?.pipeline?.status}</p>
            {progress && (
                <div>
                    Pipeline Progress:{" "}
                    <div style={{ width: "100%" }}>
                        {data.pipeline.progress?.steps.map((step) => (
                            <ProgressStep
                                key={step.step}
                                progress={step}
                                pipelineTotal={progress.total}
                            />
                        ))}
                    </div>
                </div>
            )}
            <p>Started At: {data?.pipeline?.startedAt}</p>
            <p>Stopped At: {data?.pipeline?.stoppedAt}</p>
            <p>Input: {data?.pipeline?.input}</p>
            {data?.pipeline?.status == PipelineStatus.Succeeded && (
                <p>Output: {data?.pipeline?.output}</p>
            )}
            {data?.pipeline?.status == PipelineStatus.Failed && (
                <div>
                    <p>Error: {data?.pipeline?.error}</p>{" "}
                    <p>Cause: {data?.pipeline?.cause}</p>
                </div>
            )}

            <button
                className="btn btn-secondary"
                onClick={() =>
                    setShowDataResourceProgress(
                        (prev) => !prev,
                    )}
            >
                Show Data Resource Progress
            </button>
            {showDataResourceProgress && (
                <div>
                    <h3>Data Resource Progress</h3>
                    <DataResourceProgress pipelineId={pipelineId} />
                </div>
            )}
        </div>
    );
};

export default Pipeline;
