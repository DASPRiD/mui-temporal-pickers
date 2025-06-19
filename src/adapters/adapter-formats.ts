import type { AdapterFormats } from "@mui/x-date-pickers";

export const defaultFormats: AdapterFormats = {
    year: "yyyy",
    month: "MMMM",
    monthShort: "MMM",
    dayOfMonth: "d",
    // Full day of the month format (i.e. 3rd) is not supported
    // Falling back to regular format
    dayOfMonthFull: "d",
    weekday: "cccc",
    weekdayShort: "ccc",
    hours24h: "HH",
    hours12h: "hh",
    meridiem: "a",
    minutes: "mm",
    seconds: "ss",

    fullDate: "lfd",
    keyboardDate: "lkd",
    shortDate: "lsd",
    normalDate: "lnd",
    normalDateWithWeekday: "lndw",

    fullTime12h: "lfta",
    fullTime24h: "lftd",

    keyboardDateTime12h: "lkdta",
    keyboardDateTime24h: "lkdtd",
};
