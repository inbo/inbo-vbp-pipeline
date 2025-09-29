import { useParams } from "react-router";
import { GET_PIPELINE_DATA_RESOURCE_DETAILS } from "../graphql/pipelines";
import { useQuery } from "@apollo/client/react";
import { Spinner } from "./Spinner";

type EmrErrorCause = {
    cause: {
        Step: {
            Id: string;
            Status: {
                FailureDetails: { LogFile: string; Reason: string };
                Timeline: {
                    CreationDateTime: number;
                    EndDateTime: number;
                    StartDateTime: number;
                };
            };
        };
    };
};

function isEmrErrorCause(cause: any): cause is EmrErrorCause {
    return cause?.Step !== undefined;
}

export function ErrorDetails(cause: string) {
    const parsed = JSON.parse(cause);
    const hasJson = parsed.Cause.startsWith("{");
    const parsedCause = hasJson ? JSON.parse(parsed.Cause) : null;

    if (isEmrErrorCause(parsedCause)) {
        return <EmrErrorDetails cause={parsedCause} />;
    }

    return (
        <div>
            <h5 style={{ color: "red" }}>{parsed.Error}</h5>

            {hasJson
                ? <pre>{JSON.stringify(parsedCause, null, 2)}</pre>
                : <p>{parsed.Cause}</p>}
        </div>
    );
}

function EmrErrorDetails(
    cause: EmrErrorCause,
) {
    const logUrl =
        `https://monitoring.natuurdata.dev.inbo.be/d/pipelines-logs-dev/pipelines-logs?orgId=1&refresh=1m&var-log_stream=${cause.cause.Step.Id}&from=${cause.cause.Step.Status.Timeline.StartDateTime}&to=${cause.cause.Step.Status.Timeline.EndDateTime}`;
    return (
        <div>
            <h5 style={{ color: "red" }}>EMR Step Failed</h5>
            <p>{cause?.cause?.Step?.Status?.FailureDetails?.Reason}</p>
            <a href={logUrl} target="_blank" rel="noreferrer">Logs</a>
            <pre>{JSON.stringify(cause, null, 2)}</pre>
        </div>
    );
}

export function PipelineDataResourceDetails(
    { pipelineId, dataResourceId }: {
        pipelineId?: string;
        dataResourceId?: string;
    },
) {
    if (!pipelineId || !dataResourceId) {
        const params = useParams();
        pipelineId = params.pipelineId!;
        dataResourceId = params.dataResourceId!;
    }
    const { loading, error, data } = useQuery(
        GET_PIPELINE_DATA_RESOURCE_DETAILS,
        {
            variables: {
                pipelineId: pipelineId!,
                dataResourceId: dataResourceId!,
            },
        },
    );

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            {data?.pipeline?.dataResource?.dataResource.name}:{" "}
            {data?.pipeline?.dataResource?.steps.map((step: any) => (
                <div key={step.step}>
                    <b>{step.step}</b>: {step.state}
                </div>
            ))}
        </div>
    );
}
