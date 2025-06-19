import { Container, CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import { createRoot } from "react-dom/client";
import { Components } from "./components.js";

if (typeof Temporal === "undefined") {
    await import("temporal-polyfill/global");
}

const container = document.getElementById("root");

if (!container) {
    throw new Error("Root element missing");
}

const root = createRoot(container);
const theme = createTheme();

root.render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container sx={{ py: 4 }} maxWidth="sm">
            <Components />
        </Container>
    </ThemeProvider>,
);
