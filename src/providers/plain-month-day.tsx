import { LocalizationProvider } from "@mui/x-date-pickers";
import type { ReactNode } from "react";
import { AdapterTemporalPlainMonthDay } from "../adapters/plain-month-day.js";
import { useTemporalRootContext } from "./root.js";

export type TemporalPlainMonthDayProviderProps = {
    children?: ReactNode;
};

export const TemporalPlainMonthDayProvider = ({
    children,
}: TemporalPlainMonthDayProviderProps): ReactNode => {
    const rootContext = useTemporalRootContext();

    return (
        <LocalizationProvider
            dateAdapter={AdapterTemporalPlainMonthDay}
            dateFormats={rootContext.dateFormats}
            adapterLocale={rootContext.locale}
            localeText={rootContext.localeText}
        >
            {children}
        </LocalizationProvider>
    );
};
