import type { AdapterOptions, DateBuilderReturnType } from "@mui/x-date-pickers";
import { dateFormatTokenMap } from "../locale/format/tokens.js";
import { AdapterTemporalBase } from "./base.js";
import {
    type AdapterComparisonOperations,
    type AdapterConversionOperations,
    type AdapterDateOperations,
    defaultAdapterDateOperations,
} from "./operations.js";

const conversionOperations: AdapterConversionOperations<Temporal.PlainDate> = {
    date: <T extends string | null | undefined>(value?: T): DateBuilderReturnType<T> => {
        type R = DateBuilderReturnType<T>;

        if (value === null) {
            return null as R;
        }

        if (!value) {
            return Temporal.Now.plainDateISO() as R;
        }

        return Temporal.PlainDate.from(value) as R;
    },
    toJsDate: (value) => {
        return new Date(
            value.toPlainDateTime(Temporal.PlainTime.from({ hour: 0 })).toZonedDateTime("UTC")
                .epochMilliseconds,
        );
    },
    parse: (value, format, localeSpecs) => {
        return localeSpecs.formatter.parsePlainDate(value, format);
    },
};

const comparisonOperations: AdapterComparisonOperations<Temporal.PlainDate> = {
    isEqual: (value, comparing) => value.equals(comparing),
    isSameYear: (value, comparing) => value.year === comparing.year,
    isSameMonth: (value, comparing) =>
        value.toPlainYearMonth().equals(comparing.toPlainYearMonth()),
    isSameDay: (value, comparing) => value.equals(comparing),
    isSameHour: () => true,
    isAfter: (value, comparing) => Temporal.PlainDate.compare(value, comparing) > 0,
    isAfterYear: (value, comparing) => value.year > comparing.year,
    isAfterDay: (value, comparing) => Temporal.PlainDate.compare(value, comparing) > 0,
    isBefore: (value, comparing) => Temporal.PlainDate.compare(value, comparing) < 0,
    isBeforeYear: (value, comparing) => value.year < comparing.year,
    isBeforeDay: (value, comparing) => Temporal.PlainDate.compare(value, comparing) < 0,
};

export class AdapterTemporalPlainDate extends AdapterTemporalBase<Temporal.PlainDate> {
    public readonly formatTokenMap = dateFormatTokenMap;

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
                defaultAdapterDateOperations as AdapterDateOperations<Temporal.PlainDate>,
        });
    }
}
