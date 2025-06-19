import type { AdapterOptions, DateBuilderReturnType } from "@mui/x-date-pickers";
import { dateFormatTokenMap, timeFormatTokenMap } from "../locale/format/tokens.js";
import { AdapterTemporalBase } from "./base.js";
import {
    type AdapterComparisonOperations,
    type AdapterConversionOperations,
    type AdapterDateOperations,
    type AdapterTimeOperations,
    defaultAdapterDateOperations,
    defaultAdapterTimeOperations,
} from "./operations.js";

const conversionOperations: AdapterConversionOperations<Temporal.PlainDateTime> = {
    date: <T extends string | null | undefined>(value?: T): DateBuilderReturnType<T> => {
        type R = DateBuilderReturnType<T>;

        if (value === null) {
            return null as R;
        }

        if (!value) {
            return Temporal.Now.plainDateTimeISO() as R;
        }

        return Temporal.PlainDateTime.from(value) as R;
    },
    toJsDate: (value) => {
        return new Date(value.toZonedDateTime("UTC").epochMilliseconds);
    },
    parse: (value, format, localeSpecs) => {
        return localeSpecs.formatter.parsePlainDateTime(value, format);
    },
};

const comparisonOperations: AdapterComparisonOperations<Temporal.PlainDateTime> = {
    isEqual: (value, comparing) => value.equals(comparing),
    isSameYear: (value, comparing) => value.year === comparing.year,
    isSameMonth: (value, comparing) =>
        value.toPlainDate().toPlainYearMonth().equals(comparing.toPlainDate().toPlainYearMonth()),
    isSameDay: (value, comparing) => value.equals(comparing),
    isSameHour: (value, comparing) =>
        value.toPlainDate().equals(comparing.toPlainDate()) && value.hour === comparing.hour,
    isAfter: (value, comparing) => Temporal.PlainDate.compare(value, comparing) > 0,
    isAfterYear: (value, comparing) => value.year > comparing.year,
    isAfterDay: (value, comparing) => Temporal.PlainDate.compare(value, comparing) > 0,
    isBefore: (value, comparing) => Temporal.PlainDate.compare(value, comparing) < 0,
    isBeforeYear: (value, comparing) => value.year < comparing.year,
    isBeforeDay: (value, comparing) => Temporal.PlainDate.compare(value, comparing) < 0,
};

export class AdapterTemporalPlainDateTime extends AdapterTemporalBase<Temporal.PlainDateTime> {
    public readonly formatTokenMap = { ...timeFormatTokenMap, ...dateFormatTokenMap };

    public constructor({
        locale = new Intl.Locale("en-US"),
        formats,
    }: AdapterOptions<Intl.Locale | string, never>) {
        super({
            locale,
            formats,
            conversionOperations,
            comparisonOperations,
            dateOperations:
                defaultAdapterDateOperations as AdapterDateOperations<Temporal.PlainDateTime>,
            timeOperations:
                defaultAdapterTimeOperations as AdapterTimeOperations<Temporal.PlainDateTime>,
        });
    }
}
