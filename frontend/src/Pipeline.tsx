import { useQuery } from "@apollo/client/react";
import { GET_PIPELINE } from "./graphql/pipelines";
import { useParams } from "react-router";

export const Pipeline = () => {
    let { id } = useParams();
    const { data } = useQuery(GET_PIPELINE, {
        variables: { id: id! },
    });
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
        </div>
    );
};

export default Pipeline;
