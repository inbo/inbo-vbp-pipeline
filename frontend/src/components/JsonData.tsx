import { Button } from "@mui/material";
import { useState } from "react";

export const JsonData = (
    { data, className }: { data: any; className?: string },
) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <Button className={className} onClick={() => setShow(!show)}>
                {show ? "Hide" : "Show"} JSON
            </Button>
            {show && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
};
