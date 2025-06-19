import type { AdapterOptions, DateBuilderReturnType } from "@mui/x-date-pickers";
import { timeFormatTokenMap } from "../locale/format/tokens.js";
import { AdapterTemporalBase } from "./base.js";
import {
    type AdapterComparisonOperations,
    type AdapterConversionOperations,
    type AdapterTimeOperations,
    defaultAdapterTimeOperations,
} from "./operations.js";

const conversionOperations: AdapterConversionOperations<Temporal.PlainTime> = {
    date: <T extends string | null | undefined>(value?: T): DateBuilderReturnType<T> => {
        type R = DateBuilderReturnType<T>;

        if (value === null) {
            return null as R;
        }

        if (!value) {
            return Temporal.Now.plainTimeISO() as R;
        }

        return Temporal.PlainTime.from(value) as R;
    },
    toJsDate: (value) => {
        return new Date(
            Temporal.PlainDate.from("2000-01-01").toPlainDateTime(value).toZonedDateTime("UTC")
                .epochMilliseconds,
        );
    },
    parse: (value, format, localeSpecs) => {
        return localeSpecs.formatter.parsePlainTime(value, format);
    },
};

const comparisonOperations: AdapterComparisonOperations<Temporal.PlainTime> = {
    isEqual: (value, comparing) => value.equals(comparing),
    isSameYear: () => true,
    isSameMonth: () => true,
    isSameDay: () => true,
    isSameHour: (value, comparing) => value.hour === comparing.hour,
    isAfter: (value, comparing) => Temporal.PlainTime.compare(value, comparing) > 0,
    isAfterYear: () => false,
    isAfterDay: () => false,
    isBefore: (value, comparing) => Temporal.PlainTime.compare(value, comparing) < 0,
    isBeforeYear: () => false,
    isBeforeDay: () => false,
};

export class AdapterTemporalPlainTime extends AdapterTemporalBase<Temporal.PlainTime> {
    public readonly formatTokenMap = timeFormatTokenMap;

    public constructor({
        locale = new Intl.Locale("en-US"),
        formats,
    }: AdapterOptions<Intl.Locale | string, never>) {
        super({
            locale,
            formats,
            conversionOperations,
            comparisonOperations,
            timeOperations:
                defaultAdapterTimeOperations as AdapterTimeOperations<Temporal.PlainTime>,
        });
    }
}
