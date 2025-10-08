import "../styles/Spinner.css";

import { CircularProgress } from "@mui/material";

export function Spinner({ className }: { className?: string }) {
    return (
        <div className={`spinner-container ${className}`}>
            <CircularProgress className="spinner" />
        </div>
    );
}
