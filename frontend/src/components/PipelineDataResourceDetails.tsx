import { Button } from "@mui/material";
import { JsonData } from "./JsonData";
import { settings } from "../settings";

type EmrErrorCause = {
    Step: {
        Id: string;
        Status: {
            FailureDetails?: {
                LogFile: string;
                Reason?: string;
                Message?: string;
            };
            Timeline: {
                CreationDateTime: number;
                EndDateTime: number;
                StartDateTime: number;
            };
        };
    };
};

type BatchErrorCause = {
    StartedAt: string;
    StoppedAt: string;
    Status: string;
    StatusReason: string;
    Container: {
        LogStreamName: string;
        ExitCode: number;
    };
};

function isBatchErrorCause(cause: any): cause is BatchErrorCause {
    return cause?.Container !== undefined;
}

function isEmrErrorCause(cause: any): cause is EmrErrorCause {
    return cause?.Step !== undefined;
}

export function ErrorDetails({ cause }: { cause: string }) {
    let errorComponents;
    let hasJson = false;
    let parsedCause: any = null;
    let parsed: any = null;

    parsed = JSON.parse(cause);
    hasJson = parsed.Cause.startsWith("{");
    parsedCause = hasJson ? JSON.parse(parsed.Cause) : null;

    if (isBatchErrorCause(parsedCause)) {
        errorComponents = <BatchErrorDetails cause={parsedCause} />;
    } else if (isEmrErrorCause(parsedCause)) {
        errorComponents = <EmrErrorDetails cause={parsedCause} />;
    } else {
        errorComponents = <h4>{parsed.Error}</h4>;
    }
    return (
        <div>
            {errorComponents}
            {hasJson
                ? (
                    <JsonData
                        className="pipeline-step-data-resource-details-button"
                        data={parsedCause}
                    />
                )
                : <p>{parsed ? parsed.Cause : cause}</p>}
        </div>
    );
}

function EmrErrorDetails(
    { cause }: { cause: EmrErrorCause },
) {
    const logUrl =
        `${settings.logsUrl}?refresh=1m&var-log_stream=${cause.Step.Id}&from=${cause.Step.Status.Timeline.StartDateTime}&to=${cause.Step.Status.Timeline.EndDateTime}`;
    return (
        <>
            <h4>EMR Step Failed</h4>
            {cause.Step.Status.FailureDetails?.Reason && (
                <h5 className="pipeline-step-data-resource-details-failure-reason">
                    Reason: {cause.Step.Status.FailureDetails.Reason}
                </h5>
            )}
            {cause.Step.Status.FailureDetails?.Message && (
                <h5 className="pipeline-step-data-resource-details-failure-message">
                    Message: {cause.Step.Status.FailureDetails.Message}
                </h5>
            )}
            <Button
                className="pipeline-step-data-resource-details-button"
                href={logUrl}
                target="_blank"
            >
                Logs
            </Button>
        </>
    );
}

function BatchErrorDetails(
    { cause }: { cause: BatchErrorCause },
) {
    const logUrl = `${settings.logsUrl}?refresh=1m&var-log_stream=${
        cause.Container.LogStreamName.replaceAll("/", "\\/")
    }&from=${cause.StartedAt}&to=${cause.StoppedAt}`;

    return (
        <>
            <h4>Batch Job Failed</h4>
            {cause.Status && (
                <h5 className="pipeline-step-data-resource-details-failure-reason">
                    Batch status: {cause.Status}
                </h5>
            )}
            {cause.StatusReason && (
                <h5 className="pipeline-step-data-resource-details-failure-message">
                    Reason: {cause.StatusReason}
                    <br />
                    Exit code: {cause.Container.ExitCode}
                </h5>
            )}
            <Button
                className="pipeline-step-data-resource-details-button"
                href={logUrl}
                target="_blank"
            >
                Logs
            </Button>
        </>
    );
}
