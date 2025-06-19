import { Paper, Stack, Typography } from "@mui/material";
import { DatePicker, DateTimePicker, TimePicker } from "@mui/x-date-pickers";
import { type ReactNode, useState } from "react";
import {
    TemporalPlainDateProvider,
    TemporalPlainDateTimeProvider,
    TemporalPlainTimeProvider,
    TemporalRootProvider,
    TemporalZonedDateTimeProvider,
} from "../../src/index.js";

export const Components = (): ReactNode => {
    const [time, setTime] = useState<Temporal.PlainTime | null>(Temporal.Now.plainTimeISO());
    const [date, setDate] = useState<Temporal.PlainDate | null>(Temporal.Now.plainDateISO());
    const [dateTime, setDateTime] = useState<Temporal.PlainDateTime | null>(
        Temporal.Now.plainDateTimeISO(),
    );
    const [zonedDateTime, setZonedDateTime] = useState<Temporal.ZonedDateTime | null>(
        Temporal.Now.zonedDateTimeISO(),
    );

    return (
        <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Time Picker
                </Typography>

                <Stack direction="row" spacing={2}>
                    <TemporalRootProvider>
                        <TemporalPlainTimeProvider>
                            <TimePicker
                                value={time}
                                onChange={(value) => {
                                    setTime(value as Temporal.PlainTime);
                                }}
                            />
                        </TemporalPlainTimeProvider>
                    </TemporalRootProvider>
                    <TemporalRootProvider locale="de-DE">
                        <TemporalPlainTimeProvider>
                            <TimePicker
                                value={time}
                                onChange={(value) => {
                                    setTime(value as Temporal.PlainTime);
                                }}
                            />
                        </TemporalPlainTimeProvider>
                    </TemporalRootProvider>
                </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Date Picker
                </Typography>

                <Stack direction="row" spacing={2}>
                    <TemporalRootProvider>
                        <TemporalPlainDateProvider>
                            <DatePicker
                                value={date}
                                onChange={(value) => {
                                    setDate(value as Temporal.PlainDate);
                                }}
                            />
                        </TemporalPlainDateProvider>
                    </TemporalRootProvider>
                    <TemporalRootProvider locale="de-DE">
                        <TemporalPlainDateProvider>
                            <DatePicker
                                value={date}
                                onChange={(value) => {
                                    setDate(value as Temporal.PlainDate);
                                }}
                            />
                        </TemporalPlainDateProvider>
                    </TemporalRootProvider>
                </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Date Time Picker (plain)
                </Typography>

                <Stack direction="row" spacing={2}>
                    <TemporalRootProvider>
                        <TemporalPlainDateTimeProvider>
                            <DateTimePicker
                                value={dateTime}
                                onChange={(value) => {
                                    setDateTime(value as Temporal.PlainDateTime);
                                }}
                            />
                        </TemporalPlainDateTimeProvider>
                    </TemporalRootProvider>
                    <TemporalRootProvider locale="de-DE">
                        <TemporalPlainDateTimeProvider>
                            <DateTimePicker
                                value={dateTime}
                                onChange={(value) => {
                                    setDateTime(value as Temporal.PlainDateTime);
                                }}
                            />
                        </TemporalPlainDateTimeProvider>
                    </TemporalRootProvider>
                </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Date Time Picker (zoned)
                </Typography>

                <Stack direction="row" spacing={2}>
                    <TemporalRootProvider>
                        <TemporalZonedDateTimeProvider>
                            <DateTimePicker
                                value={zonedDateTime}
                                onChange={(value) => {
                                    setZonedDateTime(value as Temporal.ZonedDateTime);
                                }}
                            />
                        </TemporalZonedDateTimeProvider>
                    </TemporalRootProvider>
                    <TemporalRootProvider locale="de-DE">
                        <TemporalZonedDateTimeProvider>
                            <DateTimePicker
                                value={zonedDateTime}
                                onChange={(value) => {
                                    setZonedDateTime(value as Temporal.ZonedDateTime);
                                }}
                            />
                        </TemporalZonedDateTimeProvider>
                    </TemporalRootProvider>
                </Stack>
            </Paper>
        </Stack>
    );
};
