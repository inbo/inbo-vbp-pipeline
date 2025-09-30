import { Button } from "@mui/material";
import { useState } from "react";

export const JsonData = ({ data }: { data: any }) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <Button variant="outlined" onClick={() => setShow(!show)}>
                {show ? "Hide" : "Show"} JSON
            </Button>
            {show && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
};
