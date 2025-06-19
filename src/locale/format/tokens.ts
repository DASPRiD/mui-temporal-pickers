import type { FieldFormatTokenMap } from "@mui/x-date-pickers";

export const dateFormatTokenMap: FieldFormatTokenMap = {
    // Year
    yy: "year",
    yyyy: { sectionType: "year", contentType: "digit", maxLength: 4 },

    // Month
    M: { sectionType: "month", contentType: "digit", maxLength: 2 },
    MM: "month",
    MMM: { sectionType: "month", contentType: "letter" },
    MMMM: { sectionType: "month", contentType: "letter" },

    // Day of the month
    d: { sectionType: "day", contentType: "digit", maxLength: 2 },
    dd: "day",

    // Day of the week
    ccc: { sectionType: "weekDay", contentType: "letter" },
    cccc: { sectionType: "weekDay", contentType: "letter" },
    ccccc: { sectionType: "weekDay", contentType: "letter" },
};

export const timeFormatTokenMap: FieldFormatTokenMap = {
    // Meridiem
    a: "meridiem",

    // Hours
    H: { sectionType: "hours", contentType: "digit", maxLength: 2 },
    HH: "hours",
    h: { sectionType: "hours", contentType: "digit", maxLength: 2 },
    hh: "hours",

    // Minutes
    m: { sectionType: "minutes", contentType: "digit", maxLength: 2 },
    mm: "minutes",

    // Seconds
    s: { sectionType: "seconds", contentType: "digit", maxLength: 2 },
    ss: "seconds",
};

export const dateTimeFormatTokenMap: FieldFormatTokenMap = {
    ...timeFormatTokenMap,
    ...dateFormatTokenMap,
};

export const standardTokens = [
    "yy",
    "yyyy",
    "M",
    "MM",
    "MMM",
    "MMMM",
    "d",
    "dd",
    "ccc",
    "cccc",
    "ccccc",
    "a",
    "H",
    "HH",
    "h",
    "hh",
    "m",
    "mm",
    "s",
    "ss",
] as const;

export const metaTokens = [
    "lfd",
    "lkd",
    "lsd",
    "lnd",
    "lndw",
    "lfta",
    "lftd",
    "lkdta",
    "lkdtd",
] as const;

export const knownTokens = [...standardTokens, ...metaTokens];
export type Token = (typeof knownTokens)[number];
