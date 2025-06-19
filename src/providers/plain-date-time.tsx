import { LocalizationProvider } from "@mui/x-date-pickers";
import type { ReactNode } from "react";
import { AdapterTemporalPlainDateTime } from "../adapters/plain-date-time.js";
import { useTemporalRootContext } from "./root.js";

export type TemporalPlainDateTimeProviderProps = {
    children?: ReactNode;
};

export const TemporalPlainDateTimeProvider = ({
    children,
}: TemporalPlainDateTimeProviderProps): ReactNode => {
    const rootContext = useTemporalRootContext();

    return (
        <LocalizationProvider
            dateAdapter={AdapterTemporalPlainDateTime}
            dateFormats={rootContext.dateFormats}
            adapterLocale={rootContext.locale}
            localeText={rootContext.localeText}
        >
            {children}
        </LocalizationProvider>
    );
};
