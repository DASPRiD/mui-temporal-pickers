import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    root: "./demo",
    build: {
        target: "es2022",
    },
    esbuild: {
        target: "es2022",
    },
    optimizeDeps: {
        esbuildOptions: {
            target: "es2022",
        },
    },
});
