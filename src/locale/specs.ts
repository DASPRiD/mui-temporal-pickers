import { Formatter } from "./format/formatter.js";
import "temporal-extra/week-info/polyfill";

const cache = new Map<string, LocaleSpecs>();

export class LocaleSpecs {
    public readonly locale: Intl.Locale;
    public readonly hour12: boolean;
    public readonly formatter: Formatter;

    private constructor(locale: Intl.Locale) {
        this.locale = locale;
        this.hour12 = is12HourCycle(locale);
        this.formatter = new Formatter(locale);
    }

    public static get(locale: Intl.Locale): LocaleSpecs {
        const cacheKey = locale.toString();
        const cached = cache.get(cacheKey);

        if (cached) {
            return cached;
        }

        const specs = new LocaleSpecs(locale);
        cache.set(cacheKey, specs);
        return specs;
    }
}

const is12HourCycle = (locale: Intl.Locale): boolean => {
    if (locale.hourCycle) {
        return locale.hourCycle === "h11" || locale.hourCycle === "h12";
    }

    return !/13/.test(
        new Intl.DateTimeFormat(locale, { hour: "numeric" }).format(
            Temporal.PlainTime.from({ hour: 13 }),
        ),
    );
};
