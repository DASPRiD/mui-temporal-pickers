import { LocalizationProvider } from "@mui/x-date-pickers";
import type { ReactNode } from "react";
import { AdapterTemporalZonedDateTime } from "../adapters/zoned-date-time.js";
import { useTemporalRootContext } from "./root.js";

export type TemporalZonedDateTimeProviderProps = {
    children?: ReactNode;
};

export const TemporalZonedDateTimeProvider = ({
    children,
}: TemporalZonedDateTimeProviderProps): ReactNode => {
    const rootContext = useTemporalRootContext();

    return (
        <LocalizationProvider
            dateAdapter={AdapterTemporalZonedDateTime}
            dateFormats={rootContext.dateFormats}
            adapterLocale={rootContext.locale}
            localeText={rootContext.localeText}
        >
            {children}
        </LocalizationProvider>
    );
};
