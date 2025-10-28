import { LocalizationProvider } from "@mui/x-date-pickers";
import type { ReactNode } from "react";
import { AdapterTemporalPlainYearMonth } from "../adapters/plain-year-month.js";
import { useTemporalRootContext } from "./root.js";

export type TemporalPlainYearMonthProviderProps = {
    children?: ReactNode;
};

export const TemporalPlainYearMonthProvider = ({
    children,
}: TemporalPlainYearMonthProviderProps): ReactNode => {
    const rootContext = useTemporalRootContext();

    return (
        <LocalizationProvider
            dateAdapter={AdapterTemporalPlainYearMonth}
            dateFormats={rootContext.dateFormats}
            adapterLocale={rootContext.locale}
            localeText={rootContext.localeText}
        >
            {children}
        </LocalizationProvider>
    );
};
