import "../styles/DataResourceProgress.css";

import { useQuery } from "@apollo/client/react";
import { GET_PIPELINE_DATA_RESOURCE_PROGRESS } from "../graphql/pipelines";
import type {
    PipelineStep,
    PipelineStepState,
} from "../__generated__/biocache-index-management/graphql";
import { type Dispatch, type SetStateAction, useCallback } from "react";
import { Spinner } from "./Spinner";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Chip,
} from "@mui/material";
import { ErrorDetails } from "./PipelineDataResourceDetails";
import { settings } from "../settings";
import { ErrorBoundary } from "react-error-boundary";

export type DataResourceFilter = {
    step?: PipelineStep;
    state?: PipelineStepState;
};

export function DataResourceProgress(
    { pipelineId, step, state }: {
        pipelineId: string;
        step: PipelineStep;
        state?: PipelineStepState;
        setDataResourceFilter: Dispatch<SetStateAction<DataResourceFilter>>;
    },
) {
    const { loading, error, data, fetchMore } = useQuery(
        GET_PIPELINE_DATA_RESOURCE_PROGRESS,
        {
            variables: { step, state, id: pipelineId, first: 10, after: null },
        },
    );

    const dataResources =
        data?.pipeline?.dataResourceProgress?.edges?.map((edge) =>
            edge?.node
        ) ||
        [];

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const element = event.currentTarget;
        if (
            data?.pipeline?.dataResourceProgress?.pageInfo?.hasNextPage &&
            Math.abs(
                    element.scrollHeight - element.scrollTop -
                        element.clientHeight,
                ) < 5
        ) {
            fetchMore({
                variables: {
                    after: data?.pipeline
                        ?.dataResourceProgress
                        ?.pageInfo
                        .endCursor,
                },
            });
        }
    }, [data, fetchMore]);

    return (
        <div
            className="pipeline-step-data-resources-list"
            onScroll={handleScroll}
        >
            {error && <li>Error: {error.message}</li>}
            {dataResources.map((
                progress: any,
            ) => (
                <Accordion
                    key={progress.dataResource?.id}
                    className={`pipeline-step-data-resource-details pipeline-step-data-resource-details-${progress.state?.toLowerCase()}`}
                >
                    <AccordionSummary
                        className="pipeline-step-data-resource-details-summary"
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <span className="pipeline-step-data-resource-details-summary-text">
                            {progress.dataResource?.name}
                            {" "}
                        </span>
                        <Chip
                            label={progress.state}
                            className={`pipeline-step-data-resource-details-chip pipeline-step-data-resource-details-chip-${progress.state?.toLowerCase()}`}
                        />
                    </AccordionSummary>
                    <AccordionDetails className="pipeline-step-data-resource-details-details">
                        {state === "FAILED" && (
                            <ErrorBoundary
                                fallback={<p>Could not load error details</p>}
                                onError={(e) => console.error(e)}
                            >
                                <ErrorDetails cause={progress.cause} />
                            </ErrorBoundary>
                        )}
                        <Button
                            className="pipeline-step-data-resource-details-button"
                            target="_blank"
                            href={`https://${settings.domain}/collectory/dataResource/show/${progress.dataResource?.id}`}
                        >
                            View in Collectory
                        </Button>
                    </AccordionDetails>
                </Accordion>
            ))}

            {loading && (
                <Spinner className="pipeline-step-data-resource-spinner" />
            )}
        </div>
    );
}
