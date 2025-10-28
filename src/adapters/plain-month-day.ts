import type { AdapterOptions, DateBuilderReturnType } from "@mui/x-date-pickers";
import { firstDayOfWeek, lastDayOfMonth, lastDayOfWeek } from "temporal-extra";
import { dateFormatTokenMap } from "../locale/format/tokens.js";
import { AdapterTemporalBase } from "./base.js";
import type { AdapterComparisonOperations, AdapterConversionOperations } from "./operations.js";

const conversionOperations: AdapterConversionOperations<Temporal.PlainMonthDay> = {
    date: <T extends string | null | undefined>(value?: T): DateBuilderReturnType<T> => {
        type R = DateBuilderReturnType<T>;

        if (value === null) {
            return null as R;
        }

        if (!value) {
            return Temporal.Now.plainDateISO().toPlainMonthDay() as R;
        }

        return Temporal.PlainDate.from(value).toPlainMonthDay() as R;
    },
    toJsDate: (value) => {
        return new Date(
            value
                .toPlainDate({ year: 2000 })
                .toPlainDateTime(Temporal.PlainTime.from({ hour: 0 }))
                .toZonedDateTime("UTC").epochMilliseconds,
        );
    },
    parse: (value, format, localeSpecs) => {
        return localeSpecs.formatter.parsePlainMonthDay(value, format);
    },
};

const comparisonOperations: AdapterComparisonOperations<Temporal.PlainMonthDay> = {
    isEqual: (value, comparing) => value.equals(comparing),
    isSameYear: () => true,
    isSameMonth: (value, comparing) => value.monthCode === comparing.monthCode,
    isSameDay: (value, comparing) => value.equals(comparing),
    isSameHour: () => true,
    isAfter: (value, comparing) => value.toString() > comparing.toString(),
    isAfterYear: () => false,
    isAfterDay: (value, comparing) => value.toString() > comparing.toString(),
    isBefore: (value, comparing) => value.toString() < comparing.toString(),
    isBeforeYear: () => false,
    isBeforeDay: (value, comparing) => value.toString() < comparing.toString(),
};

export class AdapterTemporalPlainMonthDay extends AdapterTemporalBase<Temporal.PlainMonthDay> {
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
                startOfMonth: (value) => value.with({ day: 1 }),
                startOfWeek: (value, locale) =>
                    firstDayOfWeek(value.toPlainDate({ year: 2000 }), locale).toPlainMonthDay(),
                endOfYear: (value) => value.with({ month: 12 }),
                endOfMonth: (value) =>
                    lastDayOfMonth(value.toPlainDate({ year: 2000 })).toPlainMonthDay(),
                endOfWeek: (value, locale) =>
                    lastDayOfWeek(value.toPlainDate({ year: 2000 }), locale).toPlainMonthDay(),
                addYears: (value) => value,
                addMonths: (value, amount) =>
                    value.toPlainDate({ year: 2000 }).add({ months: amount }).toPlainMonthDay(),
                addWeeks: (value, amount) =>
                    value.toPlainDate({ year: 2000 }).add({ weeks: amount }).toPlainMonthDay(),
                addDays: (value, amount) =>
                    value.toPlainDate({ year: 2000 }).add({ days: amount }).toPlainMonthDay(),
                getYear: () => 2000,
                getMonth: (value) => value.toPlainDate({ year: 2000 }).month,
                getDate: (value) => value.day,
                getDaysInMonth: (value) => value.toPlainDate({ year: 2000 }).daysInMonth,
                getWeekNumber: (value) =>
                    Math.ceil(value.toPlainDate({ year: 2000 }).dayOfYear / 7),
                getDayOfWeek: (value) =>
                    ((value.toPlainDate({ year: 2000 }).dayOfYear - 1) % 7) + 1,
                setYear: (value) => value,
                setMonth: (value, month) => value.with({ month }),
                setDate: (value, date) => value.with({ day: date }),
                getWeekArray: (value, adapter) => {
                    const daysInMonth = adapter.getDaysInMonth(value);
                    const nestedWeeks: Temporal.PlainMonthDay[][] = [];

                    for (let day = 1; day <= daysInMonth; ++day) {
                        const weekNumber = Math.floor((day - 1) / 7);
                        nestedWeeks[weekNumber] = nestedWeeks[weekNumber] ?? [];
                        nestedWeeks[weekNumber].push(value.with({ day }));
                    }

                    const lastWeek = nestedWeeks[nestedWeeks.length - 1];
                    const missingDays = 7 - lastWeek.length;
                    const currentMonth = adapter.getMonth(value);
                    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

                    for (let day = 1; day <= missingDays; ++day) {
                        lastWeek.push(value.with({ month: nextMonth, day }));
                    }

                    return nestedWeeks;
                },
                getYearRange: () => [],
            },
        });
    }
}
