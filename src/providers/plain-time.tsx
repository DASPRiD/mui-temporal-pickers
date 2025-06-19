import { LocalizationProvider } from "@mui/x-date-pickers";
import type { ReactNode } from "react";
import { AdapterTemporalPlainTime } from "../adapters/plain-time.js";
import { useTemporalRootContext } from "./root.js";

export type TemporalPlainTimeProviderProps = {
    children?: ReactNode;
};

export const TemporalPlainTimeProvider = ({
    children,
}: TemporalPlainTimeProviderProps): ReactNode => {
    const rootContext = useTemporalRootContext();

    return (
        <LocalizationProvider
            dateAdapter={AdapterTemporalPlainTime}
            dateFormats={rootContext.dateFormats}
            adapterLocale={rootContext.locale}
            localeText={rootContext.localeText}
        >
            {children}
        </LocalizationProvider>
    );
};
