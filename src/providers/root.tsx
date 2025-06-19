import type { PickersInputLocaleText } from "@mui/x-date-pickers/locales";
import type { AdapterFormats } from "@mui/x-date-pickers/models";
import { createContext, type ReactNode, useContext } from "react";

export type TemporalRootContext = {
    locale?: Intl.Locale | string;
    dateFormats?: Partial<AdapterFormats>;
    localeText?: PickersInputLocaleText;
};

export type TemporalRootProviderProps = TemporalRootContext & {
    children?: ReactNode;
};

const context = createContext<TemporalRootContext>({});

export const TemporalRootProvider = ({
    children,
    ...rest
}: TemporalRootProviderProps): ReactNode => {
    return <context.Provider value={rest}>{children}</context.Provider>;
};

export const useTemporalRootContext = (): TemporalRootContext => useContext(context);
