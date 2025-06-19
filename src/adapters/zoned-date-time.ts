import type { AdapterOptions, DateBuilderReturnType, PickersTimezone } from "@mui/x-date-pickers";
import { dateFormatTokenMap, timeFormatTokenMap } from "../locale/format/tokens.js";
import { AdapterTemporalBase } from "./base.js";
import {
    type AdapterComparisonOperations,
    type AdapterConversionOperations,
    type AdapterDateOperations,
    type AdapterTimeOperations,
    defaultAdapterDateOperations,
    defaultAdapterTimeOperations,
    resolveTimeZoneId,
} from "./operations.js";

const conversionOperations: AdapterConversionOperations<Temporal.ZonedDateTime> = {
    date: <T extends string | null | undefined>(
        value?: T,
        timezone?: PickersTimezone,
    ): DateBuilderReturnType<T> => {
        type R = DateBuilderReturnType<T>;

        if (value === null) {
            return null as R;
        }

        const plainDateTime = !value
            ? Temporal.Now.plainDateTimeISO()
            : Temporal.PlainDateTime.from(value);
        return plainDateTime.toZonedDateTime(resolveTimeZoneId(timezone)) as R;
    },
    toJsDate: (value) => {
        return new Date(value.epochMilliseconds);
    },
    parse: (value, format, localeSpecs) => {
        return (
            localeSpecs.formatter
                .parsePlainDateTime(value, format)
                ?.toZonedDateTime(Temporal.Now.timeZoneId()) ?? null
        );
    },
};

const comparisonOperations: AdapterComparisonOperations<Temporal.ZonedDateTime> = {
    isEqual: (value, comparing) => value.equals(comparing.withTimeZone(value)),
    isSameYear: (value, comparing) => value.year === comparing.withTimeZone(value).year,
    isSameMonth: (value, comparing) =>
        value
            .toPlainDate()
            .toPlainYearMonth()
            .equals(comparing.withTimeZone(value).toPlainDate().toPlainYearMonth()),
    isSameDay: (value, comparing) => value.equals(comparing.withTimeZone(value)),
    isSameHour: (value, comparing) => {
        const comparingSameZone = comparing.withTimeZone(value);
        return (
            value.toPlainDate().equals(comparingSameZone.toPlainDate()) &&
            value.hour === comparingSameZone.hour
        );
    },
    isAfter: (value, comparing) =>
        Temporal.PlainDate.compare(value, comparing.withTimeZone(value)) > 0,
    isAfterYear: (value, comparing) => value.year > comparing.withTimeZone(value).year,
    isAfterDay: (value, comparing) =>
        Temporal.PlainDate.compare(value, comparing.withTimeZone(value)) > 0,
    isBefore: (value, comparing) =>
        Temporal.PlainDate.compare(value, comparing.withTimeZone(value)) < 0,
    isBeforeYear: (value, comparing) => value.year < comparing.withTimeZone(value).year,
    isBeforeDay: (value, comparing) =>
        Temporal.PlainDate.compare(value, comparing.withTimeZone(value)) < 0,
};

export class AdapterTemporalZonedDateTime extends AdapterTemporalBase<Temporal.ZonedDateTime> {
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
                defaultAdapterDateOperations as AdapterDateOperations<Temporal.ZonedDateTime>,
            timeOperations:
                defaultAdapterTimeOperations as AdapterTimeOperations<Temporal.ZonedDateTime>,
        });
    }
}
