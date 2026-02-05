import { createTheme } from "@mui/material";

export const theme = createTheme({
    cssVariables: {
        colorSchemeSelector: "data",
        nativeColor: true,
    },
    colorSchemes: {
        dark: true,
    },
});
