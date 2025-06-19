import { type ParsedToken, parseTokenString } from "./tokenizer.js";
import { knownTokens, metaTokens, type Token } from "./tokens.js";

type Formats = {
    keyboardDate: string;
    fullTime12h: string;
    fullTime24h: string;
    keyboardDateTime12h: string;
    keyboardDateTime24h: string;
};

type FormattableValue =
    | Temporal.PlainTime
    | Temporal.PlainDate
    | Temporal.PlainDateTime
    | Temporal.ZonedDateTime;

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
    y: "year",
    yy: "year",
    M: "month",
    MM: "month",
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
    yyyy: "\\d{2}",
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
    private locale: Intl.Locale;
    private formats: Formats;

    public constructor(locale: Intl.Locale) {
        const dateTimeFormatter = new Intl.DateTimeFormat(locale);

        if (dateTimeFormatter.resolvedOptions().numberingSystem !== "latn") {
            throw new Error("Only latin numbering system is supported");
        }

        this.locale = locale;
        this.formats = collectFormats(locale);
    }

    public format(value: FormattableValue, format: string): string {
        const formattable =
            value instanceof Temporal.ZonedDateTime ? value.toPlainDateTime() : value;

        const tokens = parseTokenString(format);
        let result = "";

        for (const token of tokens) {
            if (token.type === "literal") {
                result += token.value;
                continue;
            }

            const expandedToken = expandToken(token.value, value);

            if (expandedToken) {
                result += expandedToken;
            } else if (token.value in tokenFormatOptions) {
                result += new Intl.DateTimeFormat(
                    this.locale,
                    tokenFormatOptions[token.value],
                ).format(formattable);
            }
        }

        return result;
    }

    public parsePlainTime(value: string, format: string): Temporal.PlainTime | null {
        const tokens = parseTokenString(format);
        const components = parseInputFromFormat(value, tokens);

        if (!components) {
            return null;
        }

        return Temporal.PlainTime.from({
            hour: to24Hours(components),
            minute: components.minute,
            second: components.second,
        });
    }

    public parsePlainDate(value: string, format: string): Temporal.PlainDate | null {
        const tokens = parseTokenString(format);
        const components = parseInputFromFormat(value, tokens);

        if (!components) {
            return null;
        }

        return Temporal.PlainDate.from({
            year: components.year ?? 2000,
            month: components.month ?? 1,
            day: components.day ?? 1,
        });
    }

    public parsePlainDateTime(value: string, format: string): Temporal.PlainDateTime | null {
        const tokens = parseTokenString(format);
        const components = parseInputFromFormat(value, tokens);

        if (!components) {
            return null;
        }

        return Temporal.PlainDateTime.from({
            year: components.year ?? 2000,
            month: components.month ?? 1,
            day: components.day ?? 1,
            hour: to24Hours(components),
            minute: components.minute,
            second: components.second,
        });
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
}

const expandToken = (token: Token, value: FormattableValue): string | null => {
    if (
        value instanceof Temporal.PlainDate ||
        value instanceof Temporal.PlainDateTime ||
        value instanceof Temporal.ZonedDateTime
    ) {
        switch (token) {
            case "yy":
                return value.toString().slice(-2);

            case "yyyy":
                return value.year.toString();

            case "M":
                return value.month.toString();

            case "MM":
                return value.month.toString().padStart(2, "0");

            case "d":
                return value.day.toString();

            case "dd":
                return value.day.toString().padStart(2, "0");

            case "MMM":
            case "MMMM":
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
};

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

const buildRegexFromFormat = (tokens: ParsedToken[]): { regex: RegExp; groupMap: string[] } => {
    let pattern = "^";
    const groupMap: string[] = [];

    for (const token of tokens) {
        if (token.type === "literal") {
            pattern += token.value.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
        } else {
            if (!tokenRegexMap[token.value]) {
                throw new Error(`Unsupported token: "${token.value}"`);
            }

            pattern += `(${tokenRegexMap[token.value]})`;
            groupMap.push(token.value);
        }
    }

    pattern += "$";

    return {
        regex: new RegExp(pattern),
        groupMap,
    };
};

const parseInputFromFormat = (input: string, format: ParsedToken[]): ParsedComponents | null => {
    const { regex, groupMap } = buildRegexFromFormat(format);
    const match = input.match(regex);

    if (!match) {
        return null;
    }

    const result: ParsedComponents = {};

    groupMap.forEach((token, index) => {
        const rawValue = match[index + 1];
        const field = tokenToFieldMap[token];

        if (field === "ampm") {
            result.ampm = rawValue as "AM" | "PM";
        } else {
            result[field] = Number.parseInt(rawValue, 10);
        }
    });

    return result;
};

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
