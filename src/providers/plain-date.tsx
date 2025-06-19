import { LocalizationProvider } from "@mui/x-date-pickers";
import type { ReactNode } from "react";
import { AdapterTemporalPlainDate } from "../adapters/plain-date.js";
import { useTemporalRootContext } from "./root.js";

export type TemporalPlainDateProviderProps = {
    children?: ReactNode;
};

export const TemporalPlainDateProvider = ({
    children,
}: TemporalPlainDateProviderProps): ReactNode => {
    const rootContext = useTemporalRootContext();

    return (
        <LocalizationProvider
            dateAdapter={AdapterTemporalPlainDate}
            dateFormats={rootContext.dateFormats}
            adapterLocale={rootContext.locale}
            localeText={rootContext.localeText}
        >
            {children}
        </LocalizationProvider>
    );
};
