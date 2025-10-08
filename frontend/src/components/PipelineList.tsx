import "../styles/PipelineList.css";

import { useQuery } from "@apollo/client/react";
import { GET_ALL_PIPELINES } from "../graphql/pipelines";
import { Spinner } from "./Spinner";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Pipeline from "./Pipeline";
import { PipelineHeader } from "./PipelineHeader";

export function PipelineList() {
    const { data: pipelinesData, loading, error } = useQuery(GET_ALL_PIPELINES);

    if (loading) return <Spinner />;
    if (error) return <p>Error loading pipelines: {error.message}</p>;

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
