import { useQuery } from "@apollo/client/react";
import { GET_PIPELINE_PROGRESS } from "../graphql/pipelines";
import { useParams } from "react-router";
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import {
    PipelineStatus,
    PipelineStep,
    PipelineStepState,
    type PipelineStepStats,
} from "../__generated__/biocache-index-management/graphql";

import "../styles/PipelineProgress.css";
import { NetworkStatus } from "@apollo/client";
import {
    type DataResourceFilter,
    DataResourceProgress,
} from "./DataResourceProgress";
import { Spinner } from "./Spinner";

function ProgressStepSection(
    { step, state, value, total, color, setDataResourceFilter }: {
        pipelineId: string;
        step?: PipelineStep;
        state?: PipelineStepState;
        value: number;
        total: number;
        color: string;
        setDataResourceFilter: Dispatch<SetStateAction<DataResourceFilter>>;
    },
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
            onMouseDown={() => setDataResourceFilter({ step, state })}
        >
            {value}
        </div>
    );
}

function ProgressStep(
    { pipelineId, stats, pipelineTotal, setDataResourceFilter }: {
        pipelineId: string;
        stats: PipelineStepStats;
        pipelineTotal: number;
        setDataResourceFilter: Dispatch<SetStateAction<DataResourceFilter>>;
    },
) {
    return (
        <div
            id={"progress-step-" + stats.step}
            className="progress-step"
            style={{
                flex: 1,
                maxWidth: "25%",
            }}
        >
            <div>{stats.step}: {stats.total}</div>
            <div
                className="progress"
                style={{
                    width: `${(stats.total / pipelineTotal) * 100}%`,
                }}
            >
                <ProgressStepSection
                    pipelineId={pipelineId}
                    step={stats.step}
                    state={PipelineStepState.Skipped}
                    value={stats.skipped}
                    total={stats.total}
                    color="darkgreen"
                    setDataResourceFilter={setDataResourceFilter}
                />
                <ProgressStepSection
                    pipelineId={pipelineId}
                    step={stats.step}
                    state={PipelineStepState.Succeeded}
                    value={stats.succeeded}
                    total={stats.total}
                    color="green"
                    setDataResourceFilter={setDataResourceFilter}
                />
                <ProgressStepSection
                    pipelineId={pipelineId}
                    step={stats.step}
                    state={PipelineStepState.Failed}
                    value={stats.failed}
                    total={stats.total}
                    color="red"
                    setDataResourceFilter={setDataResourceFilter}
                />
                <ProgressStepSection
                    pipelineId={pipelineId}
                    step={stats.step}
                    state={PipelineStepState.Running}
                    value={stats.running}
                    total={stats.total}
                    color="blue"
                    setDataResourceFilter={setDataResourceFilter}
                />
                <ProgressStepSection
                    pipelineId={pipelineId}
                    step={stats.step}
                    state={PipelineStepState.Queued}
                    value={stats.queued}
                    total={stats.total}
                    color="grey"
                    setDataResourceFilter={setDataResourceFilter}
                />
            </div>
        </div>
    );
}

export const Pipeline = ({ id }: { id?: string }) => {
    const pipelineId = id ?? useParams().id!;
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
        return (
            stats && (
                <div>
                    Pipeline Progress:{" "}
                    <div style={{ width: "100%" }}>
                        {stats?.steps.map((step) => (
                            <ProgressStep
                                pipelineId={pipelineId}
                                key={step.step}
                                stats={step}
                                pipelineTotal={stats.total.total}
                                setDataResourceFilter={setDataResourceFilter}
                            />
                        ))}
                    </div>
                </div>
            )
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

    return (
        <div>
            <p>ID: {data?.pipeline?.id}</p>
            <p>Status: {data?.pipeline?.status}</p>
            {progress}
            <p>Started At: {data?.pipeline?.startedAt}</p>
            <p>Stopped At: {data?.pipeline?.stoppedAt}</p>
            <div>
                Input: <pre>{data?.pipeline?.input}</pre>
            </div>
            {data?.pipeline?.status == PipelineStatus.Succeeded && (
                <div>
                    Output: <pre>{data?.pipeline?.output}</pre>
                </div>
            )}
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

            {dataResources}
        </div>
    );
};

export default Pipeline;
