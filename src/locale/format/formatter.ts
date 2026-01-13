import { type ParsedToken, parseTokenString } from "./tokenizer.js";
import { knownTokens, metaTokens, type Token } from "./tokens.js";

type Formats = {
    keyboardDate: string;
    fullTime12h: string;
    fullTime24h: string;
    keyboardDateTime12h: string;
    keyboardDateTime24h: string;
    monthNamesShort: string[];
    monthNamesLong: string[];
};

type FormattableValue =
    | Temporal.PlainTime
    | Temporal.PlainDate
    | Temporal.PlainDateTime
    | Temporal.ZonedDateTime
    | Temporal.PlainYearMonth
    | Temporal.PlainMonthDay;

const tokenFormatOptions: Partial<Record<Token, Intl.DateTimeFormatOptions>> = {
    // Standard tokens
    MMM: { month: "short" },
    MMMM: { month: "long" },
    ccc: { weekday: "short" },
    cccc: { weekday: "long" },
    ccccc: { weekday: "narrow" },

    // Meta tokens
    lfd: { day: "numeric", month: "short", year: "numeric" },
    lkd: { year: "numeric", month: "2-digit", day: "2-digit" },
    lsd: { day: "numeric", month: "short" },
    lnd: { day: "numeric", month: "long" },
    lndw: { weekday: "short", day: "numeric", month: "short" },
    lfta: { hour: "2-digit", minute: "2-digit", hourCycle: "h11" },
    lftd: { hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
    lkdta: {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h12",
    },
    lkdtd: {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    },
};

type ParsedComponents = {
    year?: number;
    month?: number;
    day?: number;
    hour12?: number;
    hour24?: number;
    minute?: number;
    second?: number;
    ampm?: "AM" | "PM";
};

const tokenToFieldMap: Record<string, keyof ParsedComponents> = {
    yy: "year",
    yyyy: "year",
    M: "month",
    MM: "month",
    MMM: "month",
    MMMM: "month",
    d: "day",
    dd: "day",
    H: "hour24",
    HH: "hour24",
    h: "hour12",
    hh: "hour12",
    m: "minute",
    mm: "minute",
    s: "second",
    ss: "second",
    a: "ampm",
};

const tokenRegexMap: Partial<Record<Token, string>> = {
    yy: "\\d{1,4}",
    yyyy: "\\d{4}",
    M: "\\d{1,2}",
    MM: "\\d{2}",
    d: "\\d{1,2}",
    dd: "\\d{2}",
    H: "\\d{1,2}",
    HH: "\\d{2}",
    h: "\\d{1,2}",
    hh: "\\d{2}",
    m: "\\d{1,2}",
    mm: "\\d{2}",
    s: "\\d{1,2}",
    ss: "\\d{2}",
    a: "(AM|PM)",
};

export class Formatter {
    private readonly locale: Intl.Locale;
    private readonly formats: Formats;
    private readonly shortMonthNameRegexp: string;
    private readonly longMonthNameRegexp: string;

    public constructor(locale: Intl.Locale) {
        const dateTimeFormatter = new Intl.DateTimeFormat(locale);

        if (dateTimeFormatter.resolvedOptions().numberingSystem !== "latn") {
            throw new Error("Only latin numbering system is supported");
        }

        this.locale = locale;
        this.formats = collectFormats(locale);
        this.shortMonthNameRegexp = `(?:${this.formats.monthNamesShort.map(escapeRegexpString).join("|")})`;
        this.longMonthNameRegexp = `(?:${this.formats.monthNamesLong.map(escapeRegexpString).join("|")})`;
    }

    public format(value: FormattableValue, format: string): string {
        let formattable = value;

        if (formattable instanceof Temporal.ZonedDateTime) {
            formattable = formattable.toPlainDateTime();
        } else if (formattable instanceof Temporal.PlainYearMonth) {
            formattable = formattable.toPlainDate({ day: 1 });
        } else if (formattable instanceof Temporal.PlainMonthDay) {
            formattable = formattable.toPlainDate({ year: 2000 });
        }

        const tokens = parseTokenString(format);
        let result = "";

        for (const token of tokens) {
            if (token.type === "literal") {
                result += token.value;
                continue;
            }

            const expandedToken = this.expandToken(token.value, value);

            if (expandedToken) {
                result += expandedToken;
            } else if (token.value in tokenFormatOptions) {
                result += new Intl.DateTimeFormat(this.locale, {
                    ...tokenFormatOptions[token.value],
                }).format(formattable);
            }
        }

        return result;
    }

    public parsePlainTime(value: string, format: string): Temporal.PlainTime | null {
        const tokens = parseTokenString(this.expandFormat(format));
        const components = this.parseInputFromFormat(value, tokens);

        if (!components) {
            return null;
        }

        try {
            return Temporal.PlainTime.from({
                hour: to24Hours(components),
                minute: components.minute,
                second: components.second,
            });
        } catch {
            return null;
        }
    }

    public parsePlainDate(value: string, format: string): Temporal.PlainDate | null {
        const tokens = parseTokenString(this.expandFormat(format));
        const components = this.parseInputFromFormat(value, tokens);

        if (!components) {
            return null;
        }

        try {
            return Temporal.PlainDate.from({
                year: components.year ?? 2000,
                month: components.month ?? 1,
                day: components.day ?? 1,
            });
        } catch {
            return null;
        }
    }

    public parsePlainDateTime(value: string, format: string): Temporal.PlainDateTime | null {
        const tokens = parseTokenString(this.expandFormat(format));
        const components = this.parseInputFromFormat(value, tokens);

        if (!components) {
            return null;
        }

        try {
            return Temporal.PlainDateTime.from({
                year: components.year ?? 2000,
                month: components.month ?? 1,
                day: components.day ?? 1,
                hour: to24Hours(components),
                minute: components.minute,
                second: components.second,
            });
        } catch {
            return null;
        }
    }

    public parsePlainYearMonth(value: string, format: string): Temporal.PlainYearMonth | null {
        const tokens = parseTokenString(this.expandFormat(format));
        const components = this.parseInputFromFormat(value, tokens);

        if (!components) {
            return null;
        }

        try {
            return Temporal.PlainYearMonth.from({
                year: components.year ?? 2000,
                month: components.month ?? 1,
            });
        } catch {
            return null;
        }
    }

    public parsePlainMonthDay(value: string, format: string): Temporal.PlainMonthDay | null {
        const tokens = parseTokenString(this.expandFormat(format));
        const components = this.parseInputFromFormat(value, tokens);

        if (!components) {
            return null;
        }

        try {
            return Temporal.PlainMonthDay.from({
                month: components.month ?? 1,
                day: components.day ?? 1,
            });
        } catch {
            return null;
        }
    }

    public expandFormat(format: string): string {
        const tokens = parseTokenString(format);
        let result = "";

        for (const token of tokens) {
            if (token.type === "literal") {
                result += escapeLiteral(token.value);
                continue;
            }

            switch (token.value) {
                case "lkd":
                    result += this.formats.keyboardDate;
                    break;

                case "lfta":
                    result += this.formats.fullTime12h;
                    break;

                case "lftd":
                    result += this.formats.fullTime24h;
                    break;

                case "lkdta":
                    result += this.formats.keyboardDateTime12h;
                    break;

                case "lkdtd":
                    result += this.formats.keyboardDateTime24h;
                    break;

                case "lfd":
                case "lsd":
                case "lnd":
                case "lndw":
                    throw new Error(`Format token '${token.value}' cannot be expanded`);

                default:
                    result += token.value;
            }
        }

        return result;
    }

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: complexity is fine
    private expandToken(token: Token, value: FormattableValue): string | null {
        const hasDate =
            value instanceof Temporal.PlainDate ||
            value instanceof Temporal.PlainDateTime ||
            value instanceof Temporal.ZonedDateTime;

        if (value instanceof Temporal.PlainYearMonth || hasDate) {
            switch (token) {
                case "yy":
                    return value.toString().slice(-2);

                case "yyyy":
                    return value.year.toString();
            }
        }

        if (
            value instanceof Temporal.PlainYearMonth ||
            value instanceof Temporal.PlainMonthDay ||
            hasDate
        ) {
            // This is based on the assumption of standard 12-month calendar years.
            const month =
                value instanceof Temporal.PlainMonthDay
                    ? value.toPlainDate({ year: 2000 }).month
                    : value.month;

            switch (token) {
                case "M":
                    return month.toString();

                case "MM":
                    return month.toString().padStart(2, "0");

                case "MMM":
                    return this.formats.monthNamesShort[month - 1];

                case "MMMM":
                    return this.formats.monthNamesLong[month - 1];
            }
        }

        if (value instanceof Temporal.PlainMonthDay || hasDate) {
            switch (token) {
                case "d":
                    return value.day.toString();

                case "dd":
                    return value.day.toString().padStart(2, "0");

                case "ccc":
                case "cccc":
                case "ccccc":
                    return null;
            }
        }

        if (
            value instanceof Temporal.PlainTime ||
            value instanceof Temporal.PlainDateTime ||
            value instanceof Temporal.ZonedDateTime
        ) {
            switch (token) {
                case "a":
                    return value.hour < 12 ? "AM" : "PM";

                case "H":
                    return value.hour.toString();

                case "HH":
                    return value.hour.toString().padStart(2, "0");

                case "h":
                    return to12Hours(value.hour).toString();

                case "hh":
                    return to12Hours(value.hour).toString().padStart(2, "0");

                case "m":
                    return value.minute.toString();

                case "mm":
                    return value.minute.toString().padStart(2, "0");

                case "s":
                    return value.second.toString();

                case "ss":
                    return value.second.toString().padStart(2, "0");
            }
        }

        if ((metaTokens as readonly string[]).includes(token)) {
            return null;
        }

        // MUI-X tries to format dates as times, even in the Date Picker; just ignore.
        return "";
    }

    private buildRegexFromFormat(tokens: ParsedToken[]): { regex: RegExp; groupMap: string[] } {
        let pattern = "^";
        const groupMap: string[] = [];

        for (const token of tokens) {
            if (token.type === "literal") {
                pattern += escapeRegexpString(token.value);
                continue;
            }

            if (token.value === "MMM") {
                pattern += `(${this.shortMonthNameRegexp})`;
                groupMap.push(token.value);
                continue;
            }

            if (token.value === "MMMM") {
                pattern += `(${this.longMonthNameRegexp})`;
                groupMap.push(token.value);
                continue;
            }

            if (!tokenRegexMap[token.value]) {
                throw new Error(`Unsupported token: "${token.value}"`);
            }

            pattern += `(${tokenRegexMap[token.value]})`;
            groupMap.push(token.value);
        }

        pattern += "$";

        return {
            regex: new RegExp(pattern),
            groupMap,
        };
    }

    private parseInputFromFormat(input: string, format: ParsedToken[]): ParsedComponents | null {
        const { regex, groupMap } = this.buildRegexFromFormat(format);
        const match = input.match(regex);

        if (!match) {
            return null;
        }

        const result: ParsedComponents = {};

        groupMap.forEach((token, index) => {
            const rawValue = match[index + 1];
            const field = tokenToFieldMap[token];

            if (field === "month" && token === "MMM") {
                result[field] = this.formats.monthNamesShort.indexOf(rawValue) + 1;
            } else if (field === "month" && token === "MMMM") {
                result[field] = this.formats.monthNamesLong.indexOf(rawValue) + 1;
            } else if (field === "ampm") {
                result.ampm = rawValue as "AM" | "PM";
            } else {
                result[field] = Number.parseInt(rawValue, 10);
            }
        });

        return result;
    }
}

const to24Hours = (components: ParsedComponents): number | undefined => {
    if (components.hour24) {
        return components.hour24;
    }

    if (!components.hour12) {
        return undefined;
    }

    if (!components.ampm) {
        throw new Error("Format is missing AM/PM");
    }

    if (components.ampm === "AM") {
        return components.hour12 === 12 ? 0 : components.hour12;
    }

    return components.hour12 === 12 ? 12 : components.hour12 + 12;
};

const to12Hours = (hour24: number): number => {
    return hour24 % 12 === 0 ? 12 : hour24 % 12;
};

const escapeRegexpString = (raw: string): string => raw.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");

const collectFormats = (locale: Intl.Locale): Formats => ({
    keyboardDate: collectFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }),
    fullTime12h: collectFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h11",
    }),
    fullTime24h: collectFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }),
    keyboardDateTime12h: collectFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h12",
    }),
    keyboardDateTime24h: collectFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }),
    monthNamesShort: collectMonthNames(locale, "short"),
    monthNamesLong: collectMonthNames(locale, "long"),
});

const collectFormat = (
    locale: Intl.Locale,
    options: Omit<Intl.DateTimeFormatOptions, "timeZone">,
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complexity is fine
): string => {
    const parts = new Intl.DateTimeFormat(locale, { ...options, timeZone: "utc" }).formatToParts(
        Temporal.PlainDateTime.from({
            year: 2018,
            month: 1,
            day: 1,
            hour: 1,
            minute: 1,
            second: 1,
        }),
    );

    let tokens = "";

    for (const part of parts) {
        switch (part.type) {
            case "day":
                tokens += part.value.length === 1 ? "d" : "dd";
                break;

            case "dayPeriod":
                tokens += "a";
                break;

            case "era":
                throw new Error("timeZoneName is not supported");

            case "hour":
                tokens += determineHourToken(part.value, options.hourCycle);
                break;

            case "minute":
                tokens += part.value.length === 1 ? "m" : "mm";
                break;

            case "month":
                tokens += part.value.length === 1 ? "M" : "MM";
                break;

            case "second":
                tokens += part.value.length === 1 ? "s" : "ss";
                break;

            case "timeZoneName":
                throw new Error("timeZoneName is not supported");

            case "weekday":
                return "c";

            case "year":
                tokens += part.value.length === 2 ? "yy" : "yyyy";
                break;

            case "literal":
                tokens += escapeLiteral(part.value);
                break;
        }
    }

    return tokens;
};

const collectMonthNames = (locale: Intl.Locale, variant: "short" | "long"): string[] => {
    const formatter = new Intl.DateTimeFormat(locale, { month: variant });
    const months: string[] = [];

    for (let month = 1; month <= 12; month++) {
        months.push(formatter.format(Temporal.PlainDate.from({ year: 2000, month, day: 1 })));
    }

    return months;
};

const determineHourToken = (
    value: string,
    hourCycle: "h11" | "h12" | "h23" | "h24" | undefined,
): string => {
    const baseToken = hourCycle?.[1] === "1" ? "h" : "H";
    return value.length === 1 ? baseToken : baseToken.repeat(2);
};

const tokenPattern = new RegExp(knownTokens.sort((a, b) => b.length - a.length).join("|"), "g");

const escapeLiteral = (literal: string): string => {
    const doubledQuotes = literal.replace(/'/g, "''");

    if (!tokenPattern.test(doubledQuotes)) {
        return doubledQuotes;
    }

    return `'${doubledQuotes}'`;
};
