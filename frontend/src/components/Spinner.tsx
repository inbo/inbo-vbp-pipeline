import "../styles/Spinner.css";

import { CircularProgress } from "@mui/material";

export function Spinner() {
    return (
        <div className="spinner-container">
            <CircularProgress className="spinner" />
        </div>
    );
}
