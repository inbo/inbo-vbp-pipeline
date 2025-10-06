import "../styles/PipelineHeader.css";

import { Link } from "react-router";
import type { Pipeline } from "../__generated__/biocache-index-management/graphql";
import { PipelineStatusChip } from "./PipelineStatusChip";
import { AccessTime, Timelapse } from "@mui/icons-material";
import { formatDuration } from "../utils/datetime";
import { settings } from "../settings";

export function PipelineHeader({ pipeline }: { pipeline: Pipeline }) {
    return (
        <div className="pipeline-header">
            <div className="pipeline-header-times">
                {pipeline.startedAt && (
                    <div className="pipeline-header-times-started-at">
                        <AccessTime className="pipeline-header-time-icon" />
                        {new Date(pipeline.startedAt)
                            .toLocaleString(settings.locale)}
                    </div>
                )}
                {pipeline.duration && (
                    <div className="pipeline-header-times-duration">
                        <Timelapse className="pipeline-header-time-icon" />
                        {formatDuration(pipeline.duration)}
                    </div>
                )}
            </div>
            <Link
                className="pipeline-header-link"
                to={`/${pipeline.id}`}
            >
                {pipeline.id}
            </Link>
            <PipelineStatusChip
                className="pipeline-header-status-chip"
                status={pipeline.status}
            />
        </div>
    );
}
