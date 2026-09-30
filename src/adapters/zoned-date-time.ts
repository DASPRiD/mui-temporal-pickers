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
    isExactTimeString,
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

        const timeZoneId = resolveTimeZoneId(timezone);

        if (!value) {
            return Temporal.Now.plainDateTimeISO().toZonedDateTime(timeZoneId) as R;
        }

        if (isExactTimeString(value)) {
            return Temporal.Instant.from(value).toZonedDateTimeISO(timeZoneId) as R;
        }

        return Temporal.PlainDateTime.from(value).toZonedDateTime(timeZoneId) as R;
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
    isSameDay: (value, comparing) =>
        value.toPlainDate().equals(comparing.withTimeZone(value).toPlainDate()),
    isSameHour: (value, comparing) => {
        const comparingSameZone = comparing.withTimeZone(value);
        return (
            value.toPlainDate().equals(comparingSameZone.toPlainDate()) &&
            value.hour === comparingSameZone.hour
        );
    },
    isAfter: (value, comparing) => Temporal.ZonedDateTime.compare(value, comparing) > 0,
    isAfterYear: (value, comparing) => value.year > comparing.withTimeZone(value).year,
    isAfterDay: (value, comparing) =>
        Temporal.PlainDate.compare(value, comparing.withTimeZone(value)) > 0,
    isBefore: (value, comparing) => Temporal.ZonedDateTime.compare(value, comparing) < 0,
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
