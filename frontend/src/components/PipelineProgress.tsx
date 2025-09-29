import { type Dispatch, type SetStateAction } from "react";
import {
    type PipelineStats,
    PipelineStep,
    PipelineStepState,
    type PipelineStepStats,
} from "../__generated__/biocache-index-management/graphql";

import "../styles/PipelineProgress.css";
import { type DataResourceFilter } from "./DataResourceProgress";
import { Button } from "@mui/material";

export function PipelineProgress(
    { pipelineId, stats, setDataResourceFilter }: {
        pipelineId: string;
        stats: PipelineStats;
        setDataResourceFilter: Dispatch<SetStateAction<DataResourceFilter>>;
    },
) {
    return (
        <div className="pipeline-progress">
            {stats?.steps.map((step) => (
                <PipelineStepProgress
                    pipelineId={pipelineId}
                    key={step.step}
                    stats={step}
                    pipelineTotal={stats.total.total}
                    setDataResourceFilter={setDataResourceFilter}
                />
            ))}
        </div>
    );
}

function PipelineStepProgressSection(
    { step, state, value, total, setDataResourceFilter }: {
        pipelineId: string;
        step?: PipelineStep;
        state?: PipelineStepState;
        value: number;
        total: number;
        setDataResourceFilter: Dispatch<SetStateAction<DataResourceFilter>>;
    },
) {
    if (value <= 0) {
        return null;
    }
    return (
        <div
            className={`pipeline-step-progress-container-section pipeline-step-progress-container-section-${state?.toLowerCase()}`}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={total}
            style={{
                width: `${Math.round((value / total) * 100)}%`,
            }}
            onMouseDown={() => setDataResourceFilter({ step, state })}
        >
            {value}
        </div>
    );
}

function PipelineStepProgress(
    { pipelineId, stats, pipelineTotal, setDataResourceFilter }: {
        pipelineId: string;
        stats: PipelineStepStats;
        pipelineTotal: number;
        setDataResourceFilter: Dispatch<SetStateAction<DataResourceFilter>>;
    },
) {
    return (
        <div
            id={"pipeline-step-progress-" + stats.step}
            className="pipeline-step-progress"
        >
            <div className="pipeline-step-progress-label">
                <Button
                    onClick={() =>
                        setDataResourceFilter({
                            step: stats.step,
                            state: undefined,
                        })}
                >
                    {stats.step}
                </Button>
            </div>
            <div
                className="pipeline-step-progress-container"
                style={{
                    maxWidth: `${
                        Math.round((stats.total / pipelineTotal) * 100)
                    }%`,
                }}
            >
                <PipelineStepProgressSection
                    pipelineId={pipelineId}
                    step={stats.step}
                    state={PipelineStepState.Skipped}
                    value={stats.skipped}
                    total={stats.total}
                    setDataResourceFilter={setDataResourceFilter}
                />
                <PipelineStepProgressSection
                    pipelineId={pipelineId}
                    step={stats.step}
                    state={PipelineStepState.Succeeded}
                    value={stats.succeeded}
                    total={stats.total}
                    setDataResourceFilter={setDataResourceFilter}
                />
                <PipelineStepProgressSection
                    pipelineId={pipelineId}
                    step={stats.step}
                    state={PipelineStepState.Failed}
                    value={stats.failed}
                    total={stats.total}
                    setDataResourceFilter={setDataResourceFilter}
                />
                <PipelineStepProgressSection
                    pipelineId={pipelineId}
                    step={stats.step}
                    state={PipelineStepState.Running}
                    value={stats.running}
                    total={stats.total}
                    setDataResourceFilter={setDataResourceFilter}
                />
                <PipelineStepProgressSection
                    pipelineId={pipelineId}
                    step={stats.step}
                    state={PipelineStepState.Queued}
                    value={stats.queued}
                    total={stats.total}
                    setDataResourceFilter={setDataResourceFilter}
                />
            </div>
        </div>
    );
}
