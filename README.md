# Temporal Pickers for MUI X

[![Release](https://github.com/dasprid/mui-temporal-pickers/actions/workflows/release.yml/badge.svg)](https://github.com/dasprid/mui-temporal-pickers/actions/workflows/release.yml)

A small utility library providing [Temporal](https://tc39.es/proposal-temporal/) support for
[MUI X Date and Time Pickers](https://mui.com/x/react-date-pickers/).

This package bridges the gap between MUI X and the TC39 Temporal API by introducing context-based providers that adapt
pickers to work seamlessly with `Temporal.PlainDate`, `Temporal.PlainTime`, `Temporal.PlainDateTime`, and
`Temporal.ZonedDateTime`.

## Features

- Plug-and-play support for Temporal types in MUI X pickers
- Supports all major temporal types: `PlainDate`, `PlainTime`, `PlainDateTime`, `ZonedDateTime`, `PlainYearMonth` and
  `PlainMonthDay`
- Global locale, format, and text customization via root provider
- Fully tree-shakable and composable
- Built-in localization fallback to `en-US`

## Getting Started

Install via your favorite package manager:

```bash
npm install mui-temporal-pickers
# or
pnpm add mui-temporal-pickers
# or
yarn add mui-temporal-pickers
```

### Try the demo

This repository includes a working demo app. You can run it locally using:

```bash
pnpm demo
```

This will launch a Vite-powered playground with all picker types wired up.

## Using the Temporal Polyfill

If you want to use the [Temporal API](https://tc39.es/proposal-temporal/) in environments where it is not yet natively
supported, you can include the [temporal-polyfill](https://www.npmjs.com/package/temporal-polyfill).

Once you have it installed, you can enable it:

```ts
if (typeof Temporal === "undefined") {
    await import("temporal-polyfill/global");
}
```

This will globally patch the environment, adding the Temporal API on `globalThis.Temporal`.

### TypeScript support for Temporal

To get proper TypeScript typings for the polyfill (and the Temporal API in general), you need to install the
[temporal-spec](https://www.npmjs.com/package/temporal-spec) types package.

Then create a `temporal.d.ts` file in your project (e.g., in your `src` folder or your `types` folder) with the
following content:

```ts
import "temporal-spec/global";
```

This will augment the TypeScript global scope with Temporal API types, so your editor and compiler understand `Temporal`
properly.

## Usage

### 1. (Optional) Wrap your app with TemporalRootProvider

This allows you to configure global `locale`, `dateFormats`, and `localeText`, similar to MUI's `LocalizationProvider`.
You can omit this if you don't need customization.

```tsx
import { TemporalRootProvider } from 'mui-temporal-pickers';

<TemporalRootProvider locale="de-DE">
    <App />
</TemporalRootProvider>
```

### 2. Wrap pickers with the appropriate Temporal provider

You must wrap each picker (or group of same-kind pickers) in a provider that matches the Temporal type being used.

```tsx
import { TemporalPlainDateProvider } from 'mui-temporal-pickers';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';

// Example: PlainDate
<TemporalPlainDateProvider>
    <DatePicker
        label="PlainDate"
        value={Temporal.PlainDate.from('2025-06-19')}
        onChange={(val) => console.log(val?.toString())}
    />
</TemporalPlainDateProvider>
```

Pickers **must be wrapped** in the matching provider to work correctly. Mixed types or mismatched types will result in
runtime errors.

## Usage with `PlainYearMonth` and `PlainMonthDay`

To use `PlainYearMonth` and `PlainMonthDay` with the pickers, you must use a `DatePicker` with
`views={['month', 'year']}` or a `DatePicker` with `views={['month', 'day']}` respectively.

For `PlainMonthDay`, you might also want to disable the week days, as they make no sense without a year. To do so, set
`dayOfWeekFormatter={() => ""}`.

## Caveats

### Limited formatting token support

Due to how `Intl.DateTimeFormat` works, text field formatting only supports numeric tokens (like `yyyy`, `MM`, `dd`,
`HH`, `mm`). Literal characters (like slashes or dashes) are fine.

The only non-numeric token allowed is **AM/PM**, which is not currently localized and always displays as `"AM"` /
`"PM"`. Additionally, "MMM" and "MMMM" are supported, although they might yield ideal values for every locale.

### No runtime validation of input types

For performance reasons, this library **does not validate** that the value passed to a picker matches the expected
Temporal type. Passing an incorrect type (e.g., `PlainDate` to a time picker) will lead to downstream errors from MUI
or the Temporal API.

Use with care and ensure values match the context's expectation.

## Package Goals

- Stay minimal: no runtime conversions or unnecessary wrappers
- Keep compatibility with MUI X moving forward
- Encourage adoption of Temporal without losing MUI's power
