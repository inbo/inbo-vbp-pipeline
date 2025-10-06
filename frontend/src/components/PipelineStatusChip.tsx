import { Chip } from "@mui/material";
import "../styles/PipelineStatusChip.css";

export function PipelineStatusChip(
    { status, className }: { status: string; className?: string },
) {
    return (
        <Chip
            label={status}
            className={`pipeline-status-chip pipeline-status-chip-${status.toLowerCase()} ${className}`}
        />
    );
}
