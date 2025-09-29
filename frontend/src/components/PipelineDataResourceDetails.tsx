import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
} from "@mui/material";

type EmrErrorCause = {
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

function isEmrErrorCause(cause: any): cause is EmrErrorCause {
    return cause?.Step !== undefined;
}

export function ErrorDetails({ cause }: { cause: string }) {
    const parsed = JSON.parse(cause);
    const hasJson = parsed.Cause.startsWith("{");
    const parsedCause = hasJson ? JSON.parse(parsed.Cause) : null;

    return (
        <div>
            {isEmrErrorCause(parsedCause) ? "EMR Step Failed" : parsed.Error}
            {hasJson
                ? <pre>{JSON.stringify(parsedCause, null, 2)}</pre>
                : <p>{parsed.Cause}</p>}
        </div>
    );
}

function EmrErrorDetails(
    { cause }: { cause: EmrErrorCause },
) {
    const logUrl =
        `https://monitoring.natuurdata.dev.inbo.be/d/pipelines-logs-dev/pipelines-logs?orgId=1&refresh=1m&var-log_stream=${cause.Step.Id}&from=${cause.Step.Status.Timeline.StartDateTime}&to=${cause.Step.Status.Timeline.EndDateTime}`;
    return (
        <div>
            <h5>{cause?.Step?.Status?.FailureDetails?.Reason}</h5>
            <a href={logUrl} target="_blank" rel="noreferrer">Logs</a>
            <pre>{JSON.stringify(cause, null, 2)}</pre>
        </div>
    );
}
