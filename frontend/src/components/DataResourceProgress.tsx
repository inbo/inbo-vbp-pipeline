import "../styles/DataResourceProgress.css";

import { useQuery } from "@apollo/client/react";
import { GET_PIPELINE_DATA_RESOURCE_PROGRESS } from "../graphql/pipelines";
import type {
    PipelineStep,
    PipelineStepState,
} from "../__generated__/biocache-index-management/graphql";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import { Spinner } from "./Spinner";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Chip,
    Typography,
} from "@mui/material";
import { ErrorDetails } from "./PipelineDataResourceDetails";

export type DataResourceFilter = {
    step?: PipelineStep;
    state?: PipelineStepState;
};

export function DataResourceProgress(
    { pipelineId, step, state, setDataResourceFilter }: {
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

    return (
        <div>
            {error && <li>Error: {error.message}</li>}
            {dataResources.map((
                progress: any,
            ) => (
                <Accordion
                    key={progress.dataResource.id}
                    className={`pipeline-step-data-resource-details pipeline-step-data-resource-details-${state?.toLowerCase()}`}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography>
                            {progress.dataResource.name}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <a
                            target="_blank"
                            href={`https://natuurdata.dev.inbo.be/collectory/dataResource/show/${progress.dataResource.id}`}
                        >
                            View in Collectory
                        </a>
                        {state === "FAILED" && (
                            <ErrorDetails cause={progress.cause} />
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}

            {loading
                ? <Spinner />
                : data?.pipeline?.dataResourceProgress?.pageInfo
                    ?.hasNextPage &&
                    (
                        <button
                            onClick={() => {
                                fetchMore({
                                    variables: {
                                        after: data.pipeline
                                            ?.dataResourceProgress
                                            ?.pageInfo
                                            .endCursor,
                                    },
                                });
                            }}
                        >
                            Load More
                        </button>
                    )}
        </div>
    );
}
