import { Chip } from "@mui/material";
import "../styles/PipelineStatusChip.css";

export function PipelineStatusChip({ status }: { status: string }) {
    return (
        <Chip
            label={status}
            className={`pipeline-status-chip pipeline-status-chip-${status.toLowerCase()}`}
        />
    );
}
