import type {
    AdapterFormats,
    AdapterOptions,
    DateBuilderReturnType,
    FieldFormatTokenMap,
    MuiPickersAdapter,
    PickersTimezone,
} from "@mui/x-date-pickers";
import { LocaleSpecs } from "../locale/specs.js";
import { defaultFormats } from "./adapter-formats.js";
import {
    type AdapterComparisonOperations,
    type AdapterConversionOperations,
    type AdapterDateOperations,
    type AdapterTimeOperations,
    type AdapterTimezoneOperations,
    noopAdapterDateOperations,
    noopAdapterTimeOperations,
    noopAdapterTimezoneOperations,
} from "./operations.js";

export type ValidTemporal =
    | Temporal.PlainTime
    | Temporal.PlainDate
    | Temporal.PlainDateTime
    | Temporal.ZonedDateTime
    | Temporal.PlainYearMonth
    | Temporal.PlainMonthDay;

export type ValidTimeTemporal =
    | Temporal.PlainTime
    | Temporal.PlainDateTime
    | Temporal.ZonedDateTime;
export type ValidDateTemporal =
    | Temporal.PlainDate
    | Temporal.PlainDateTime
    | Temporal.ZonedDateTime;

declare module "@mui/x-date-pickers/models" {
    interface PickerValidDateLookup {
        temporal: ValidTemporal;
    }
}

type AdapterTemporalOptions<T extends ValidTemporal> = {
    conversionOperations: AdapterConversionOperations<T>;
    comparisonOperations: AdapterComparisonOperations<T>;
    dateOperations?: AdapterDateOperations<T>;
    timeOperations?: AdapterTimeOperations<T>;
    timezoneOperations?: AdapterTimezoneOperations<T>;
};

export abstract class AdapterTemporalBase<TTemporal extends ValidTemporal>
    implements MuiPickersAdapter<Intl.Locale>
{
    public readonly isMUIAdapter = true;
    public readonly isTimezoneCompatible = true;
    public readonly lib = "temporal";
    public readonly locale: Intl.Locale;
    public readonly formats: AdapterFormats;
    public readonly escapedCharacters = { start: "'", end: "'" };

    public abstract readonly formatTokenMap: FieldFormatTokenMap;

    protected readonly localeSpecs: LocaleSpecs;

    protected readonly conversionOperations: AdapterConversionOperations<TTemporal>;
    protected readonly comparisonOperations: AdapterComparisonOperations<TTemporal>;
    protected readonly dateOperations: AdapterDateOperations<TTemporal>;
    protected readonly timeOperations: AdapterTimeOperations<TTemporal>;
    protected readonly timezoneOperations: AdapterTimezoneOperations<TTemporal>;

    protected constructor({
        locale = new Intl.Locale("en-US"),
        formats,
        conversionOperations,
        comparisonOperations,
        dateOperations = noopAdapterDateOperations as unknown as AdapterDateOperations<TTemporal>,
        timeOperations = noopAdapterTimeOperations as unknown as AdapterTimeOperations<TTemporal>,
        timezoneOperations = noopAdapterTimezoneOperations as unknown as AdapterTimezoneOperations<TTemporal>,
    }: AdapterOptions<Intl.Locale | string, never> & AdapterTemporalOptions<TTemporal>) {
        this.locale = typeof locale === "string" ? new Intl.Locale(locale) : locale;
        this.localeSpecs = LocaleSpecs.get(this.locale);
        this.formats = { ...defaultFormats, ...formats };

        this.conversionOperations = conversionOperations;
        this.comparisonOperations = comparisonOperations;
        this.dateOperations = dateOperations;
        this.timeOperations = timeOperations;
        this.timezoneOperations = timezoneOperations;
    }

    public date<T extends string | null | undefined>(
        value?: T,
        timezone?: PickersTimezone,
    ): DateBuilderReturnType<T> {
        return this.conversionOperations.date(value, timezone);
    }

    public toJsDate(value: TTemporal): Date {
        return this.conversionOperations.toJsDate(value);
    }

    public parse(value: string, format: string): TTemporal | null {
        return this.conversionOperations.parse(value, format, this.localeSpecs);
    }

    public isEqual(value: TTemporal | null, comparing: TTemporal | null): boolean {
        if (value === null && comparing === null) {
            return true;
        }

        if (value === null || comparing === null) {
            return false;
        }

        return this.comparisonOperations.isEqual(value, comparing);
    }

    public isSameYear(value: TTemporal, comparing: TTemporal): boolean {
        return this.comparisonOperations.isSameYear(value, comparing);
    }

    public isSameMonth(value: TTemporal, comparing: TTemporal): boolean {
        return this.comparisonOperations.isSameMonth(value, comparing);
    }

    public isSameDay(value: TTemporal, comparing: TTemporal): boolean {
        return this.comparisonOperations.isSameDay(value, comparing);
    }

    public isSameHour(value: TTemporal, comparing: TTemporal): boolean {
        return this.comparisonOperations.isSameHour(value, comparing);
    }

    public isAfter(value: TTemporal, comparing: TTemporal): boolean {
        return this.comparisonOperations.isAfter(value, comparing);
    }

    public isAfterYear(value: TTemporal, comparing: TTemporal): boolean {
        return this.comparisonOperations.isAfterYear(value, comparing);
    }

    public isAfterDay(value: TTemporal, comparing: TTemporal): boolean {
        return this.comparisonOperations.isAfterDay(value, comparing);
    }

    public isBefore(value: TTemporal, comparing: TTemporal): boolean {
        return this.comparisonOperations.isBefore(value, comparing);
    }

    public isBeforeYear(value: TTemporal, comparing: TTemporal): boolean {
        return this.comparisonOperations.isBeforeYear(value, comparing);
    }

    public isBeforeDay(value: TTemporal, comparing: TTemporal): boolean {
        return this.comparisonOperations.isBeforeDay(value, comparing);
    }

    public getInvalidDate(): TTemporal {
        return null as unknown as TTemporal;
    }

    public getTimezone(value: TTemporal | null): PickersTimezone {
        return this.timezoneOperations.getTimezone(value);
    }

    public setTimezone(value: TTemporal, timezone: PickersTimezone): TTemporal {
        return this.timezoneOperations.setTimezone(value, timezone);
    }

    public getCurrentLocaleCode(): string {
        return this.locale.toString();
    }

    public is12HourCycleInCurrentLocale(): boolean {
        return this.localeSpecs.hour12;
    }

    public expandFormat(format: string): string {
        return this.localeSpecs.formatter.expandFormat(format);
    }

    public isValid(value: TTemporal | null): value is TTemporal {
        return value !== null;
    }

    public format(value: TTemporal, formatKey: keyof AdapterFormats): string {
        return this.formatByString(value, this.formats[formatKey]);
    }

    public formatByString(value: TTemporal, format: string): string {
        if (format === "s" && !("second" in value)) {
            // This is MUI-X collecting localized digits. It allows us to return "0" here, which makes it fall back to
            // non-localized digits!
            return "0";
        }

        return this.localeSpecs.formatter.format(value, format);
    }

    public formatNumber(numberToFormat: string): string {
        return numberToFormat;
    }

    public isWithinRange(value: TTemporal, [start, end]: [TTemporal, TTemporal]): boolean {
        return !(
            this.comparisonOperations.isBefore(value, start) ||
            this.comparisonOperations.isAfter(value, end)
        );
    }

    public startOfYear(value: TTemporal): TTemporal {
        return this.dateOperations.startOfYear(value);
    }

    public startOfMonth(value: TTemporal): TTemporal {
        return this.dateOperations.startOfMonth(value);
    }

    public startOfWeek(value: TTemporal): TTemporal {
        return this.dateOperations.startOfWeek(value, this.locale);
    }

    public startOfDay(value: TTemporal): TTemporal {
        return this.timeOperations.startOfDay(value);
    }

    public endOfYear(value: TTemporal): TTemporal {
        return this.dateOperations.endOfYear(value);
    }

    public endOfMonth(value: TTemporal): TTemporal {
        return this.dateOperations.endOfMonth(value);
    }

    public endOfWeek(value: TTemporal): TTemporal {
        return this.dateOperations.endOfWeek(value, this.locale);
    }

    public endOfDay(value: TTemporal): TTemporal {
        return this.timeOperations.endOfDay(value);
    }

    public addYears(value: TTemporal, amount: number): TTemporal {
        return this.dateOperations.addYears(value, amount);
    }

    public addMonths(value: TTemporal, amount: number): TTemporal {
        return this.dateOperations.addMonths(value, amount);
    }

    public addWeeks(value: TTemporal, amount: number): TTemporal {
        return this.dateOperations.addWeeks(value, amount);
    }

    public addDays(value: TTemporal, amount: number): TTemporal {
        return this.dateOperations.addDays(value, amount);
    }

    public addHours(value: TTemporal, amount: number): TTemporal {
        return this.timeOperations.addHours(value, amount);
    }

    public addMinutes(value: TTemporal, amount: number): TTemporal {
        return this.timeOperations.addMinutes(value, amount);
    }

    public addSeconds(value: TTemporal, amount: number): TTemporal {
        return this.timeOperations.addSeconds(value, amount);
    }

    public getYear(value: TTemporal): number {
        return this.dateOperations.getYear(value);
    }

    public getMonth(value: TTemporal): number {
        return this.dateOperations.getMonth(value);
    }

    public getDate(value: TTemporal): number {
        return this.dateOperations.getDate(value);
    }

    public getHours(value: TTemporal): number {
        return this.timeOperations.getHours(value);
    }

    public getMinutes(value: TTemporal): number {
        return this.timeOperations.getMinutes(value);
    }

    public getSeconds(value: TTemporal): number {
        return this.timeOperations.getSeconds(value);
    }

    public getMilliseconds(value: TTemporal): number {
        return this.timeOperations.getMilliseconds(value);
    }

    public getDaysInMonth(value: TTemporal): number {
        return this.dateOperations.getDaysInMonth(value);
    }

    public getWeekNumber(value: TTemporal): number {
        return this.dateOperations.getWeekNumber(value);
    }

    public getDayOfWeek(value: TTemporal): number {
        return this.dateOperations.getDayOfWeek(value);
    }

    public setYear(value: TTemporal, year: number): TTemporal {
        try {
            return this.dateOperations.setYear(value, year);
        } catch {
            return null as unknown as TTemporal;
        }
    }

    public setMonth(value: TTemporal, month: number): TTemporal {
        try {
            return this.dateOperations.setMonth(value, month);
        } catch {
            return null as unknown as TTemporal;
        }
    }

    public setDate(value: TTemporal, date: number): TTemporal {
        try {
            return this.dateOperations.setDate(value, date);
        } catch {
            return null as unknown as TTemporal;
        }
    }

    public setHours(value: TTemporal, hours: number): TTemporal {
        try {
            return this.timeOperations.setHours(value, hours);
        } catch {
            return null as unknown as TTemporal;
        }
    }

    public setMinutes(value: TTemporal, minutes: number): TTemporal {
        try {
            return this.timeOperations.setMinutes(value, minutes);
        } catch {
            return null as unknown as TTemporal;
        }
    }

    public setSeconds(value: TTemporal, seconds: number): TTemporal {
        try {
            return this.timeOperations.setSeconds(value, seconds);
        } catch {
            return null as unknown as TTemporal;
        }
    }

    public setMilliseconds(value: TTemporal, milliseconds: number): TTemporal {
        try {
            return this.timeOperations.setMilliseconds(value, milliseconds);
        } catch {
            return null as unknown as TTemporal;
        }
    }

    public getWeekArray(value: TTemporal): TTemporal[][] {
        return this.dateOperations.getWeekArray(value, this);
    }

    public getYearRange(range: [TTemporal, TTemporal]): TTemporal[] {
        return this.dateOperations.getYearRange(range, this);
    }
}
