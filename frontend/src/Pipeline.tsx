import { useQuery } from "@apollo/client/react";
import { GET_PIPELINE } from "./graphql/pipelines";
import { useParams } from "react-router";
import { useState } from "react";
import { DataResourceProgress } from "./components/DataResourceProgress";

export const Pipeline = () => {
    let { id } = useParams();
    const { data } = useQuery(GET_PIPELINE, {
        variables: { id: id! },
    });
    const [showDataResourceProgress, setShowDataResourceProgress] = useState<
        boolean
    >(false);

    return (
        <div>
            <h1>Data Pipeline</h1>
            <p>Pipeline ID: {data?.pipeline?.id}</p>
            <p>Pipeline Status: {data?.pipeline?.status}</p>
            <p>Pipeline Started At: {data?.pipeline?.startedAt}</p>
            <p>Pipeline Stopped At: {data?.pipeline?.stoppedAt}</p>
            <p>Pipeline Input: {data?.pipeline?.input}</p>
            <p>Pipeline Output: {data?.pipeline?.output}</p>
            <p>Pipeline Error: {data?.pipeline?.error}</p>
            <p>Pipeline Cause: {data?.pipeline?.cause}</p>

            <button
                className="btn btn-secondary"
                onClick={() =>
                    setShowDataResourceProgress(
                        (prev) => !prev,
                    )}
            >
                Show Data Resource Progress
            </button>
            {showDataResourceProgress && (
                <div>
                    <h3>Data Resource Progress</h3>
                    <DataResourceProgress pipelineId={id!} />
                </div>
            )}
        </div>
    );
};

export default Pipeline;
