import type { DateBuilderReturnType, PickersTimezone } from "@mui/x-date-pickers";
import {
    firstDayOfMonth,
    firstDayOfWeek,
    firstDayOfYear,
    lastDayOfMonth,
    lastDayOfWeek,
    lastDayOfYear,
} from "temporal-extra";
import type { LocaleSpecs } from "../locale/specs.js";
import type {
    AdapterTemporalBase,
    ValidDateTemporal,
    ValidTemporal,
    ValidTimeTemporal,
} from "./base.js";

export type AdapterConversionOperations<T extends ValidTemporal> = {
    date: <T extends string | null | undefined>(
        value?: T,
        timezone?: PickersTimezone,
    ) => DateBuilderReturnType<T>;
    toJsDate: (value: T) => Date;
    parse: (value: string, format: string, localeSpecs: LocaleSpecs) => T | null;
};

export type AdapterComparisonOperations<T extends ValidTemporal> = {
    isEqual: (value: T, comparing: T) => boolean;
    isSameYear: (value: T, comparing: T) => boolean;
    isSameMonth: (value: T, comparing: T) => boolean;
    isSameDay: (value: T, comparing: T) => boolean;
    isSameHour: (value: T, comparing: T) => boolean;
    isAfter: (value: T, comparing: T) => boolean;
    isAfterYear: (value: T, comparing: T) => boolean;
    isAfterDay: (value: T, comparing: T) => boolean;
    isBefore: (value: T, comparing: T) => boolean;
    isBeforeYear: (value: T, comparing: T) => boolean;
    isBeforeDay: (value: T, comparing: T) => boolean;
};

export type AdapterDateOperations<T extends ValidTemporal> = {
    startOfYear: (value: T) => T;
    startOfMonth: (value: T) => T;
    startOfWeek: (value: T, locale: Intl.Locale) => T;
    endOfYear: (value: T) => T;
    endOfMonth: (value: T) => T;
    endOfWeek: (value: T, locale: Intl.Locale) => T;
    addYears: (value: T, amount: number) => T;
    addMonths: (value: T, amount: number) => T;
    addWeeks: (value: T, amount: number) => T;
    addDays: (value: T, amount: number) => T;
    getYear: (value: T) => number;
    getMonth: (value: T) => number;
    getDate: (value: T) => number;
    getDaysInMonth: (value: T) => number;
    getWeekNumber: (value: T) => number;
    getDayOfWeek: (value: T) => number;
    setYear: (value: T, year: number) => T;
    setMonth: (value: T, month: number) => T;
    setDate: (value: T, date: number) => T;
    getWeekArray: (value: T, adapter: AdapterTemporalBase<T>) => T[][];
    getYearRange: ([start, end]: [T, T], adapter: AdapterTemporalBase<T>) => T[];
};

export const noopAdapterDateOperations: AdapterDateOperations<ValidTemporal> = {
    startOfYear: (value) => value,
    startOfMonth: (value) => value,
    startOfWeek: (value) => value,
    endOfYear: (value) => value,
    endOfMonth: (value) => value,
    endOfWeek: (value) => value,
    addYears: (value) => value,
    addMonths: (value) => value,
    addWeeks: (value) => value,
    addDays: (value) => value,
    getYear: () => 2000,
    getMonth: () => 1,
    getDate: () => 1,
    getDaysInMonth: () => 30,
    getWeekNumber: () => 1,
    getDayOfWeek: () => 1,
    setYear: (value) => value,
    setMonth: (value) => value,
    setDate: (value) => value,
    getWeekArray: () => [],
    getYearRange: () => [],
};

export const defaultAdapterDateOperations: AdapterDateOperations<ValidDateTemporal> = {
    startOfYear: (value) => firstDayOfYear(value),
    startOfMonth: (value) => firstDayOfMonth(value),
    startOfWeek: (value, locale) => firstDayOfWeek(value, locale),
    endOfYear: (value) => lastDayOfYear(value),
    endOfMonth: (value) => lastDayOfMonth(value),
    endOfWeek: (value, locale) => lastDayOfWeek(value, locale),
    addYears: (value, amount) => value.add({ years: amount }),
    addMonths: (value, amount) => value.add({ months: amount }),
    addWeeks: (value, amount) => value.add({ weeks: amount }),
    addDays: (value, amount) => value.add({ days: amount }),
    getYear: (value) => value.year,
    getMonth: (value) => value.month,
    getDate: (value) => value.day,
    getDaysInMonth: (value) => value.daysInMonth,
    getWeekNumber: (value) => {
        if (!value.weekOfYear) {
            throw new Error("Date is in a calendar system without weeks");
        }

        return value.weekOfYear;
    },
    getDayOfWeek: (value) => value.dayOfWeek,
    setYear: (value, year) => value.with({ year }),
    setMonth: (value, month) => value.with({ month }),
    setDate: (value, date) => value.with({ day: date }),
    getWeekArray: (value, adapter) => {
        const start = adapter.startOfWeek(adapter.startOfMonth(value));
        const end = adapter.endOfWeek(adapter.endOfMonth(value));

        let count = 0;
        let current = start;
        const nestedWeeks: ValidDateTemporal[][] = [];

        while (!adapter.isAfter(current, end)) {
            const weekNumber = Math.floor(count / 7);
            nestedWeeks[weekNumber] = nestedWeeks[weekNumber] ?? [];
            nestedWeeks[weekNumber].push(current);

            current = adapter.addDays(current, 1);
            count += 1;
        }

        return nestedWeeks;
    },
    getYearRange: ([start, end], adapter) => {
        const startDate = adapter.startOfYear(start);
        const endDate = adapter.endOfYear(end);
        const years: ValidDateTemporal[] = [];

        let current = startDate;

        while (adapter.isBeforeYear(current, endDate)) {
            years.push(current);
            current = adapter.addYears(current, 1);
        }

        return years;
    },
};

export type AdapterTimeOperations<T extends ValidTemporal> = {
    startOfDay: (value: T) => T;
    endOfDay: (value: T) => T;
    addHours: (value: T, amount: number) => T;
    addMinutes: (value: T, amount: number) => T;
    addSeconds: (value: T, amount: number) => T;
    setHours: (value: T, hours: number) => T;
    setMinutes: (value: T, minutes: number) => T;
    setSeconds: (value: T, seconds: number) => T;
    setMilliseconds: (value: T, milliseconds: number) => T;
    getHours: (value: T) => number;
    getMinutes: (value: T) => number;
    getSeconds: (value: T) => number;
    getMilliseconds: (value: T) => number;
};

export const noopAdapterTimeOperations: AdapterTimeOperations<ValidTemporal> = {
    startOfDay: (value) => value,
    endOfDay: (value) => value,
    addHours: (value) => value,
    addMinutes: (value) => value,
    addSeconds: (value) => value,
    setHours: (value) => value,
    setMinutes: (value) => value,
    setSeconds: (value) => value,
    setMilliseconds: (value) => value,
    getHours: () => 0,
    getMinutes: () => 0,
    getSeconds: () => 0,
    getMilliseconds: () => 0,
};

export const defaultAdapterTimeOperations: AdapterTimeOperations<ValidTimeTemporal> = {
    startOfDay: (value) => value.with({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
    endOfDay: (value) =>
        value.with({
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 999,
        }),
    addHours: (value, amount) => value.add({ hours: amount }),
    addMinutes: (value, amount) => value.add({ minutes: amount }),
    addSeconds: (value, amount) => value.add({ seconds: amount }),
    setHours: (value, hours) => value.with({ hour: hours }),
    setMinutes: (value, minutes) => value.with({ minute: minutes }),
    setSeconds: (value, seconds) => value.with({ second: seconds }),
    setMilliseconds: (value, milliseconds) => value.with({ millisecond: milliseconds }),
    getHours: (value) => value.hour,
    getMinutes: (value) => value.minute,
    getSeconds: (value) => value.second,
    getMilliseconds: (value) => value.millisecond,
};

export type AdapterTimezoneOperations<T extends ValidTemporal> = {
    getTimezone: (value: T | null) => PickersTimezone;
    setTimezone: (value: T, timezone: PickersTimezone) => T;
};

export const noopAdapterTimezoneOperations: AdapterTimezoneOperations<ValidTemporal> = {
    getTimezone: () => "default",
    setTimezone: (value) => value,
};

export const resolveTimeZoneId = (timezone?: PickersTimezone): string => {
    if (!timezone || timezone === "default" || timezone === "system") {
        return Temporal.Now.timeZoneId();
    }

    return timezone;
};

export const defaultAdapterTimezoneOperations: AdapterTimezoneOperations<Temporal.ZonedDateTime> = {
    getTimezone: (value) => (value === null ? "default" : value.timeZoneId),
    setTimezone: (value, timezone) => value.withTimeZone(resolveTimeZoneId(timezone)),
};
