import { useQuery } from "@apollo/client/react";
import { PipelineStatus } from "../__generated__/biocache-index-management/graphql";
import { GET_ALL_PIPELINES } from "../graphql/pipelines";
import Pipeline from "./Pipeline";
import { Link } from "react-router";
import { Button } from "@mui/material";

export function RunningPipelines() {
    const { data: pipelinesData } = useQuery(GET_ALL_PIPELINES, {
        variables: { status: PipelineStatus.Running },
    });

    const hasRunning = (pipelinesData?.pipelines.length ?? 0) > 0;

    return (
        <div>
            {hasRunning && (
                <>
                    <h2>Running Pipelines:</h2>

                    <ul>
                        {pipelinesData?.pipelines.map((pipeline) => (
                            <Pipeline key={pipeline.id} id={pipeline.id} />
                        ))}
                    </ul>
                </>
            )}
            {pipelinesData && (
                <>
                    <Button
                        variant={hasRunning ? "outlined" : "contained"}
                        color={hasRunning ? "warning" : "primary"}
                        component={Link}
                        to="/start"
                    >
                        {hasRunning
                            ? "Start Another Pipeline"
                            : "Start New Pipeline"}
                    </Button>
                    {hasRunning && (
                        <p>
                            A pipeline is already running. Running multiple
                            pipelines at the same time may overload upstream
                            services.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
