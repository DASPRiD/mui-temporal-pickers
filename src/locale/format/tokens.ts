import type { FieldFormatTokenMap } from "@mui/x-date-pickers";

export const dateFormatTokenMap: FieldFormatTokenMap = {
    // Year
    yy: { sectionType: "year", contentType: "digit", maxLength: 2 },
    yyyy: { sectionType: "year", contentType: "digit", maxLength: 4 },

    // Month
    M: { sectionType: "month", contentType: "digit", maxLength: 2 },
    MM: { sectionType: "month", contentType: "digit", maxLength: 2 },
    MMM: { sectionType: "month", contentType: "letter" },
    MMMM: { sectionType: "month", contentType: "letter" },

    // Day of the month
    d: { sectionType: "day", contentType: "digit", maxLength: 2 },
    dd: { sectionType: "day", contentType: "digit", maxLength: 2 },

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
    HH: { sectionType: "hours", contentType: "digit", maxLength: 2 },
    h: { sectionType: "hours", contentType: "digit", maxLength: 2 },
    hh: { sectionType: "hours", contentType: "digit", maxLength: 2 },

    // Minutes
    m: { sectionType: "minutes", contentType: "digit", maxLength: 2 },
    mm: { sectionType: "minutes", contentType: "digit", maxLength: 2 },

    // Seconds
    s: { sectionType: "seconds", contentType: "digit", maxLength: 2 },
    ss: { sectionType: "seconds", contentType: "digit", maxLength: 2 },
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
