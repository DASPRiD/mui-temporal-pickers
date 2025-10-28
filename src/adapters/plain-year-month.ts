import type { AdapterOptions, DateBuilderReturnType } from "@mui/x-date-pickers";
import { dateFormatTokenMap } from "../locale/format/tokens.js";
import { AdapterTemporalBase } from "./base.js";
import type { AdapterComparisonOperations, AdapterConversionOperations } from "./operations.js";

const conversionOperations: AdapterConversionOperations<Temporal.PlainYearMonth> = {
    date: <T extends string | null | undefined>(value?: T): DateBuilderReturnType<T> => {
        type R = DateBuilderReturnType<T>;

        if (value === null) {
            return null as R;
        }

        if (!value) {
            return Temporal.Now.plainDateISO().toPlainYearMonth() as R;
        }

        return Temporal.PlainDate.from(value).toPlainYearMonth() as R;
    },
    toJsDate: (value) => {
        return new Date(
            value
                .toPlainDate({ day: 1 })
                .toPlainDateTime(Temporal.PlainTime.from({ hour: 0 }))
                .toZonedDateTime("UTC").epochMilliseconds,
        );
    },
    parse: (value, format, localeSpecs) => {
        return localeSpecs.formatter.parsePlainYearMonth(value, format);
    },
};

const comparisonOperations: AdapterComparisonOperations<Temporal.PlainYearMonth> = {
    isEqual: (value, comparing) => value.equals(comparing),
    isSameYear: (value, comparing) => value.year === comparing.year,
    isSameMonth: (value, comparing) => value.equals(comparing),
    isSameDay: (value, comparing) => value.equals(comparing),
    isSameHour: () => true,
    isAfter: (value, comparing) => Temporal.PlainYearMonth.compare(value, comparing) > 0,
    isAfterYear: (value, comparing) => value.year > comparing.year,
    isAfterDay: (value, comparing) => Temporal.PlainYearMonth.compare(value, comparing) > 0,
    isBefore: (value, comparing) => Temporal.PlainYearMonth.compare(value, comparing) < 0,
    isBeforeYear: (value, comparing) => value.year < comparing.year,
    isBeforeDay: (value, comparing) => Temporal.PlainYearMonth.compare(value, comparing) < 0,
};

export class AdapterTemporalPlainYearMonth extends AdapterTemporalBase<Temporal.PlainYearMonth> {
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
            dateOperations: {
                startOfYear: (value) => value.with({ month: 1 }),
                startOfMonth: (value) => value,
                startOfWeek: (value) => value,
                endOfYear: (value) => value.with({ month: 12 }),
                endOfMonth: (value) => value,
                endOfWeek: (value) => value,
                addYears: (value, amount) => value.add({ years: amount }),
                addMonths: (value, amount) => value.add({ months: amount }),
                addWeeks: (value) => value,
                addDays: (value) => value,
                getYear: (value) => value.year,
                getMonth: (value) => value.month,
                getDate: () => 1,
                getDaysInMonth: (value) => value.daysInMonth,
                getWeekNumber: () => 1,
                getDayOfWeek: () => 1,
                setYear: (value, year) => value.with({ year }),
                setMonth: (value, month) => value.with({ month }),
                setDate: (value) => value,
                getWeekArray: () => [],
                getYearRange: ([start, end], adapter) => {
                    const startDate = adapter.startOfYear(start);
                    const endDate = adapter.endOfYear(end);
                    const years: Temporal.PlainYearMonth[] = [];

                    let current = startDate;

                    while (adapter.isBeforeYear(current, endDate)) {
                        years.push(current);
                        current = adapter.addYears(current, 1);
                    }

                    return years;
                },
            },
        });
    }
}
