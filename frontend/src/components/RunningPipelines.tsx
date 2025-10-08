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

    return (
        <div>
            {pipelinesData?.pipelines.length === 0
                ? (
                    <Button
                        variant="contained"
                        component={Link}
                        to="/start"
                    >
                        Start New Pipeline
                    </Button>
                )
                : (
                    <>
                        <h2>Running Pipelines:</h2>

                        <ul>
                            {pipelinesData?.pipelines.map((pipeline) => (
                                <Pipeline key={pipeline.id} id={pipeline.id} />
                            ))}
                        </ul>
                    </>
                )}
        </div>
    );
}
