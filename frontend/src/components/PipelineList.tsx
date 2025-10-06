import "../styles/PipelineList.css";

import { useMutation, useQuery } from "@apollo/client/react";
import { CANCEL_PIPELINE, GET_ALL_PIPELINES } from "../graphql/pipelines";
import { Link } from "react-router";
import { Spinner } from "./Spinner";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { settings } from "../settings";
import { AccessTime, Timer } from "@mui/icons-material";
import { PipelineStatusChip } from "./PipelineStatusChip";
import Pipeline from "./Pipeline";
import { formatDuration } from "../utils/datetime";
import { PipelineHeader } from "./PipelineHeader";

export function PipelineList() {
    const { data: pipelinesData, loading, error } = useQuery(GET_ALL_PIPELINES);
    const [
        cancelPipeline,
        {
            loading: cancelPipelineLoading,
            error: cancelPipelineError,
        },
    ] = useMutation(
        CANCEL_PIPELINE,
    );

    if (loading) return <Spinner />;
    if (error) return <p>Error loading pipelines: {error.message}</p>;
    if (cancelPipelineError) {
        return <p>Error cancelling pipeline: {cancelPipelineError.message}</p>;
    }

    return (
        <div className="pipeline-list">
            {pipelinesData?.pipelines.map((pipeline) => (
                <Accordion
                    key={pipeline.id}
                    className={`pipeline-list-item`}
                    slotProps={{ transition: { unmountOnExit: true } }}
                >
                    <AccordionSummary
                        className="pipeline-list-item-summary"
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <PipelineHeader pipeline={pipeline} />
                    </AccordionSummary>
                    <AccordionDetails className="pipeline-list-item-details">
                        <Pipeline id={pipeline.id} showHeader={false} />
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
}
