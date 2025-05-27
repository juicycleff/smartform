import React, { forwardRef, memo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * A flexible box/block component with extensive styling options
 * Serves as a foundational layout primitive for building consistent UIs
 */
const boxVariants = cva("", {
  variants: {
    // Layout
    display: {
      block: "sf:block",
      inline: "sf:inline",
      flex: "sf:flex",
      inlineFlex: "sf:inline-flex",
      grid: "sf:grid",
      inlineGrid: "sf:inline-grid",
      hidden: "sf:hidden",
    },
    position: {
      static: "sf:static",
      relative: "sf:relative",
      absolute: "sf:absolute",
      fixed: "sf:fixed",
      sticky: "sf:sticky",
    },
    // Flex & Grid
    direction: {
      row: "sf:flex-row",
      column: "sf:flex-col",
      rowReverse: "sf:flex-row-reverse",
      columnReverse: "sf:flex-col-reverse",
    },
    align: {
      start: "sf:items-start",
      center: "sf:items-center",
      end: "sf:items-end",
      baseline: "sf:items-baseline",
      stretch: "sf:items-stretch",
    },
    justify: {
      start: "sf:justify-start",
      center: "sf:justify-center",
      end: "sf:justify-end",
      between: "sf:justify-between",
      around: "sf:justify-around",
      evenly: "sf:justify-evenly",
    },
    wrap: {
      wrap: "sf:flex-wrap",
      nowrap: "sf:flex-nowrap",
      wrapReverse: "sf:flex-wrap-reverse",
    },
    gap: {
      0: "sf:gap-0",
      px: "sf:gap-px",
      0.5: "sf:gap-0.5",
      1: "sf:gap-1",
      1.5: "sf:gap-1.5",
      2: "sf:gap-2",
      2.5: "sf:gap-2.5",
      3: "sf:gap-3",
      3.5: "sf:gap-3.5",
      4: "sf:gap-4",
      5: "sf:gap-5",
      6: "sf:gap-6",
      7: "sf:gap-7",
      8: "sf:gap-8",
      9: "sf:gap-9",
      10: "sf:gap-10",
      11: "sf:gap-11",
      12: "sf:gap-12",
      14: "sf:gap-14",
      16: "sf:gap-16",
      20: "sf:gap-20",
      24: "sf:gap-24",
      28: "sf:gap-28",
      32: "sf:gap-32",
      36: "sf:gap-36",
      40: "sf:gap-40",
      44: "sf:gap-44",
      48: "sf:gap-48",
      52: "sf:gap-52",
      56: "sf:gap-56",
      60: "sf:gap-60",
      64: "sf:gap-64",
      72: "sf:gap-72",
      80: "sf:gap-80",
      96: "sf:gap-96",
      xs: "sf:gap-2",
      sm: "sf:gap-4",
      md: "sf:gap-6",
      lg: "sf:gap-8",
      xl: "sf:gap-10",
      "2xl": "sf:gap-12",
      "3xl": "sf:gap-16",
      "4xl": "sf:gap-20",
      "5xl": "sf:gap-24",
      "6xl": "sf:gap-32",
      "7xl": "sf:gap-40",
    },
    // Padding
    p: {
      0: "sf:p-0",
      px: "sf:p-px",
      0.5: "sf:p-0.5",
      1: "sf:p-1",
      1.5: "sf:p-1.5",
      2: "sf:p-2",
      2.5: "sf:p-2.5",
      3: "sf:p-3",
      3.5: "sf:p-3.5",
      4: "sf:p-4",
      5: "sf:p-5",
      6: "sf:p-6",
      7: "sf:p-7",
      8: "sf:p-8",
      9: "sf:p-9",
      10: "sf:p-10",
      11: "sf:p-11",
      12: "sf:p-12",
      14: "sf:p-14",
      16: "sf:p-16",
      20: "sf:p-20",
      24: "sf:p-24",
      28: "sf:p-28",
      32: "sf:p-32",
      36: "sf:p-36",
      40: "sf:p-40",
      44: "sf:p-44",
      48: "sf:p-48",
      52: "sf:p-52",
      56: "sf:p-56",
      60: "sf:p-60",
      64: "sf:p-64",
      72: "sf:p-72",
      80: "sf:p-80",
      96: "sf:p-96",
      xs: "sf:p-2",
      sm: "sf:p-4",
      md: "sf:p-6",
      lg: "sf:p-8",
      xl: "sf:p-10",
      "2xl": "sf:p-12",
      "3xl": "sf:p-16",
      "4xl": "sf:p-20",
      "5xl": "sf:p-24",
      "6xl": "sf:p-32",
      "7xl": "sf:p-40",
    },
    px: {
      0: "sf:px-0",
      px: "sf:px-px",
      0.5: "sf:px-0.5",
      1: "sf:px-1",
      1.5: "sf:px-1.5",
      2: "sf:px-2",
      2.5: "sf:px-2.5",
      3: "sf:px-3",
      3.5: "sf:px-3.5",
      4: "sf:px-4",
      5: "sf:px-5",
      6: "sf:px-6",
      7: "sf:px-7",
      8: "sf:px-8",
      9: "sf:px-9",
      10: "sf:px-10",
      11: "sf:px-11",
      12: "sf:px-12",
      14: "sf:px-14",
      16: "sf:px-16",
      20: "sf:px-20",
      24: "sf:px-24",
      28: "sf:px-28",
      32: "sf:px-32",
      36: "sf:px-36",
      40: "sf:px-40",
      44: "sf:px-44",
      48: "sf:px-48",
      52: "sf:px-52",
      56: "sf:px-56",
      60: "sf:px-60",
      64: "sf:px-64",
      72: "sf:px-72",
      80: "sf:px-80",
      96: "sf:px-96",
      xs: "sf:px-2",
      sm: "sf:px-4",
      md: "sf:px-6",
      lg: "sf:px-8",
      xl: "sf:px-10",
      "2xl": "sf:px-12",
      "3xl": "sf:px-16",
      "4xl": "sf:px-20",
      "5xl": "sf:px-24",
      "6xl": "sf:px-32",
      "7xl": "sf:px-40",
    },
    py: {
      0: "sf:py-0",
      px: "sf:py-px",
      0.5: "sf:py-0.5",
      1: "sf:py-1",
      1.5: "sf:py-1.5",
      2: "sf:py-2",
      2.5: "sf:py-2.5",
      3: "sf:py-3",
      3.5: "sf:py-3.5",
      4: "sf:py-4",
      5: "sf:py-5",
      6: "sf:py-6",
      7: "sf:py-7",
      8: "sf:py-8",
      9: "sf:py-9",
      10: "sf:py-10",
      11: "sf:py-11",
      12: "sf:py-12",
      14: "sf:py-14",
      16: "sf:py-16",
      20: "sf:py-20",
      24: "sf:py-24",
      28: "sf:py-28",
      32: "sf:py-32",
      36: "sf:py-36",
      40: "sf:py-40",
      44: "sf:py-44",
      48: "sf:py-48",
      52: "sf:py-52",
      56: "sf:py-56",
      60: "sf:py-60",
      64: "sf:py-64",
      72: "sf:py-72",
      80: "sf:py-80",
      96: "sf:py-96",
      xs: "sf:py-2",
      sm: "sf:py-4",
      md: "sf:py-6",
      lg: "sf:py-8",
      xl: "sf:py-10",
      "2xl": "sf:py-12",
      "3xl": "sf:py-16",
      "4xl": "sf:py-20",
      "5xl": "sf:py-24",
      "6xl": "sf:py-32",
      "7xl": "sf:py-40",
    },
    pt: {
      0: "sf:pt-0",
      px: "sf:pt-px",
      0.5: "sf:pt-0.5",
      1: "sf:pt-1",
      1.5: "sf:pt-1.5",
      2: "sf:pt-2",
      2.5: "sf:pt-2.5",
      3: "sf:pt-3",
      3.5: "sf:pt-3.5",
      4: "sf:pt-4",
      5: "sf:pt-5",
      6: "sf:pt-6",
      7: "sf:pt-7",
      8: "sf:pt-8",
      9: "sf:pt-9",
      10: "sf:pt-10",
      11: "sf:pt-11",
      12: "sf:pt-12",
      14: "sf:pt-14",
      16: "sf:pt-16",
      20: "sf:pt-20",
      24: "sf:pt-24",
      28: "sf:pt-28",
      32: "sf:pt-32",
      36: "sf:pt-36",
      40: "sf:pt-40",
      44: "sf:pt-44",
      48: "sf:pt-48",
      52: "sf:pt-52",
      56: "sf:pt-56",
      60: "sf:pt-60",
      64: "sf:pt-64",
      72: "sf:pt-72",
      80: "sf:pt-80",
      96: "sf:pt-96",
      xs: "sf:pt-2",
      sm: "sf:pt-4",
      md: "sf:pt-6",
      lg: "sf:pt-8",
      xl: "sf:pt-10",
      "2xl": "sf:pt-12",
      "3xl": "sf:pt-16",
      "4xl": "sf:pt-20",
      "5xl": "sf:pt-24",
      "6xl": "sf:pt-32",
      "7xl": "sf:pt-40",
    },
    pb: {
      0: "sf:pb-0",
      px: "sf:pb-px",
      0.5: "sf:pb-0.5",
      1: "sf:pb-1",
      1.5: "sf:pb-1.5",
      2: "sf:pb-2",
      2.5: "sf:pb-2.5",
      3: "sf:pb-3",
      3.5: "sf:pb-3.5",
      4: "sf:pb-4",
      5: "sf:pb-5",
      6: "sf:pb-6",
      7: "sf:pb-7",
      8: "sf:pb-8",
      9: "sf:pb-9",
      10: "sf:pb-10",
      11: "sf:pb-11",
      12: "sf:pb-12",
      14: "sf:pb-14",
      16: "sf:pb-16",
      20: "sf:pb-20",
      24: "sf:pb-24",
      28: "sf:pb-28",
      32: "sf:pb-32",
      36: "sf:pb-36",
      40: "sf:pb-40",
      44: "sf:pb-44",
      48: "sf:pb-48",
      52: "sf:pb-52",
      56: "sf:pb-56",
      60: "sf:pb-60",
      64: "sf:pb-64",
      72: "sf:pb-72",
      80: "sf:pb-80",
      96: "sf:pb-96",
      xs: "sf:pb-2",
      sm: "sf:pb-4",
      md: "sf:pb-6",
      lg: "sf:pb-8",
      xl: "sf:pb-10",
      "2xl": "sf:pb-12",
      "3xl": "sf:pb-16",
      "4xl": "sf:pb-20",
      "5xl": "sf:pb-24",
      "6xl": "sf:pb-32",
      "7xl": "sf:pb-40",
    },
    pl: {
      0: "sf:pl-0",
      px: "sf:pl-px",
      0.5: "sf:pl-0.5",
      1: "sf:pl-1",
      1.5: "sf:pl-1.5",
      2: "sf:pl-2",
      2.5: "sf:pl-2.5",
      3: "sf:pl-3",
      3.5: "sf:pl-3.5",
      4: "sf:pl-4",
      5: "sf:pl-5",
      6: "sf:pl-6",
      7: "sf:pl-7",
      8: "sf:pl-8",
      9: "sf:pl-9",
      10: "sf:pl-10",
      11: "sf:pl-11",
      12: "sf:pl-12",
      14: "sf:pl-14",
      16: "sf:pl-16",
      20: "sf:pl-20",
      24: "sf:pl-24",
      28: "sf:pl-28",
      32: "sf:pl-32",
      36: "sf:pl-36",
      40: "sf:pl-40",
      44: "sf:pl-44",
      48: "sf:pl-48",
      52: "sf:pl-52",
      56: "sf:pl-56",
      60: "sf:pl-60",
      64: "sf:pl-64",
      72: "sf:pl-72",
      80: "sf:pl-80",
      96: "sf:pl-96",
      xs: "sf:pl-2",
      sm: "sf:pl-4",
      md: "sf:pl-6",
      lg: "sf:pl-8",
      xl: "sf:pl-10",
      "2xl": "sf:pl-12",
      "3xl": "sf:pl-16",
      "4xl": "sf:pl-20",
      "5xl": "sf:pl-24",
      "6xl": "sf:pl-32",
      "7xl": "sf:pl-40",
    },
    pr: {
      0: "sf:pr-0",
      px: "sf:pr-px",
      0.5: "sf:pr-0.5",
      1: "sf:pr-1",
      1.5: "sf:pr-1.5",
      2: "sf:pr-2",
      2.5: "sf:pr-2.5",
      3: "sf:pr-3",
      3.5: "sf:pr-3.5",
      4: "sf:pr-4",
      5: "sf:pr-5",
      6: "sf:pr-6",
      7: "sf:pr-7",
      8: "sf:pr-8",
      9: "sf:pr-9",
      10: "sf:pr-10",
      11: "sf:pr-11",
      12: "sf:pr-12",
      14: "sf:pr-14",
      16: "sf:pr-16",
      20: "sf:pr-20",
      24: "sf:pr-24",
      28: "sf:pr-28",
      32: "sf:pr-32",
      36: "sf:pr-36",
      40: "sf:pr-40",
      44: "sf:pr-44",
      48: "sf:pr-48",
      52: "sf:pr-52",
      56: "sf:pr-56",
      60: "sf:pr-60",
      64: "sf:pr-64",
      72: "sf:pr-72",
      80: "sf:pr-80",
      96: "sf:pr-96",
      xs: "sf:pr-2",
      sm: "sf:pr-4",
      md: "sf:pr-6",
      lg: "sf:pr-8",
      xl: "sf:pr-10",
      "2xl": "sf:pr-12",
      "3xl": "sf:pr-16",
      "4xl": "sf:pr-20",
      "5xl": "sf:pr-24",
      "6xl": "sf:pr-32",
      "7xl": "sf:pr-40",
    },
    // Margin
    m: {
      0: "sf:m-0",
      px: "sf:m-px",
      0.5: "sf:m-0.5",
      1: "sf:m-1",
      1.5: "sf:m-1.5",
      2: "sf:m-2",
      2.5: "sf:m-2.5",
      3: "sf:m-3",
      3.5: "sf:m-3.5",
      4: "sf:m-4",
      5: "sf:m-5",
      6: "sf:m-6",
      7: "sf:m-7",
      8: "sf:m-8",
      9: "sf:m-9",
      10: "sf:m-10",
      11: "sf:m-11",
      12: "sf:m-12",
      14: "sf:m-14",
      16: "sf:m-16",
      20: "sf:m-20",
      24: "sf:m-24",
      28: "sf:m-28",
      32: "sf:m-32",
      36: "sf:m-36",
      40: "sf:m-40",
      44: "sf:m-44",
      48: "sf:m-48",
      52: "sf:m-52",
      56: "sf:m-56",
      60: "sf:m-60",
      64: "sf:m-64",
      72: "sf:m-72",
      80: "sf:m-80",
      96: "sf:m-96",
      auto: "sf:m-auto",
      xs: "sf:m-2",
      sm: "sf:m-4",
      md: "sf:m-6",
      lg: "sf:m-8",
      xl: "sf:m-10",
      "2xl": "sf:m-12",
      "3xl": "sf:m-16",
      "4xl": "sf:m-20",
      "5xl": "sf:m-24",
      "6xl": "sf:m-32",
      "7xl": "sf:m-40",
    },
    mx: {
      0: "sf:mx-0",
      px: "sf:mx-px",
      0.5: "sf:mx-0.5",
      1: "sf:mx-1",
      1.5: "sf:mx-1.5",
      2: "sf:mx-2",
      2.5: "sf:mx-2.5",
      3: "sf:mx-3",
      3.5: "sf:mx-3.5",
      4: "sf:mx-4",
      5: "sf:mx-5",
      6: "sf:mx-6",
      7: "sf:mx-7",
      8: "sf:mx-8",
      9: "sf:mx-9",
      10: "sf:mx-10",
      11: "sf:mx-11",
      12: "sf:mx-12",
      14: "sf:mx-14",
      16: "sf:mx-16",
      20: "sf:mx-20",
      24: "sf:mx-24",
      28: "sf:mx-28",
      32: "sf:mx-32",
      36: "sf:mx-36",
      40: "sf:mx-40",
      44: "sf:mx-44",
      48: "sf:mx-48",
      52: "sf:mx-52",
      56: "sf:mx-56",
      60: "sf:mx-60",
      64: "sf:mx-64",
      72: "sf:mx-72",
      80: "sf:mx-80",
      96: "sf:mx-96",
      auto: "sf:mx-auto",
      xs: "sf:mx-2",
      sm: "sf:mx-4",
      md: "sf:mx-6",
      lg: "sf:mx-8",
      xl: "sf:mx-10",
      "2xl": "sf:mx-12",
      "3xl": "sf:mx-16",
      "4xl": "sf:mx-20",
      "5xl": "sf:mx-24",
      "6xl": "sf:mx-32",
      "7xl": "sf:mx-40",
    },
    my: {
      0: "sf:my-0",
      px: "sf:my-px",
      0.5: "sf:my-0.5",
      1: "sf:my-1",
      1.5: "sf:my-1.5",
      2: "sf:my-2",
      2.5: "sf:my-2.5",
      3: "sf:my-3",
      3.5: "sf:my-3.5",
      4: "sf:my-4",
      5: "sf:my-5",
      6: "sf:my-6",
      7: "sf:my-7",
      8: "sf:my-8",
      9: "sf:my-9",
      10: "sf:my-10",
      11: "sf:my-11",
      12: "sf:my-12",
      14: "sf:my-14",
      16: "sf:my-16",
      20: "sf:my-20",
      24: "sf:my-24",
      28: "sf:my-28",
      32: "sf:my-32",
      36: "sf:my-36",
      40: "sf:my-40",
      44: "sf:my-44",
      48: "sf:my-48",
      52: "sf:my-52",
      56: "sf:my-56",
      60: "sf:my-60",
      64: "sf:my-64",
      72: "sf:my-72",
      80: "sf:my-80",
      96: "sf:my-96",
      auto: "sf:my-auto",
      xs: "sf:my-2",
      sm: "sf:my-4",
      md: "sf:my-6",
      lg: "sf:my-8",
      xl: "sf:my-10",
      "2xl": "sf:my-12",
      "3xl": "sf:my-16",
      "4xl": "sf:my-20",
      "5xl": "sf:my-24",
      "6xl": "sf:my-32",
      "7xl": "sf:my-40",
    },
    mt: {
      0: "sf:mt-0",
      px: "sf:mt-px",
      0.5: "sf:mt-0.5",
      1: "sf:mt-1",
      1.5: "sf:mt-1.5",
      2: "sf:mt-2",
      2.5: "sf:mt-2.5",
      3: "sf:mt-3",
      3.5: "sf:mt-3.5",
      4: "sf:mt-4",
      5: "sf:mt-5",
      6: "sf:mt-6",
      7: "sf:mt-7",
      8: "sf:mt-8",
      9: "sf:mt-9",
      10: "sf:mt-10",
      11: "sf:mt-11",
      12: "sf:mt-12",
      14: "sf:mt-14",
      16: "sf:mt-16",
      20: "sf:mt-20",
      24: "sf:mt-24",
      28: "sf:mt-28",
      32: "sf:mt-32",
      36: "sf:mt-36",
      40: "sf:mt-40",
      44: "sf:mt-44",
      48: "sf:mt-48",
      52: "sf:mt-52",
      56: "sf:mt-56",
      60: "sf:mt-60",
      64: "sf:mt-64",
      72: "sf:mt-72",
      80: "sf:mt-80",
      96: "sf:mt-96",
      auto: "sf:mt-auto",
      xs: "sf:mt-2",
      sm: "sf:mt-4",
      md: "sf:mt-6",
      lg: "sf:mt-8",
      xl: "sf:mt-10",
      "2xl": "sf:mt-12",
      "3xl": "sf:mt-16",
      "4xl": "sf:mt-20",
      "5xl": "sf:mt-24",
      "6xl": "sf:mt-32",
      "7xl": "sf:mt-40",
    },
    mb: {
      0: "sf:mb-0",
      px: "sf:mb-px",
      0.5: "sf:mb-0.5",
      1: "sf:mb-1",
      1.5: "sf:mb-1.5",
      2: "sf:mb-2",
      2.5: "sf:mb-2.5",
      3: "sf:mb-3",
      3.5: "sf:mb-3.5",
      4: "sf:mb-4",
      5: "sf:mb-5",
      6: "sf:mb-6",
      7: "sf:mb-7",
      8: "sf:mb-8",
      9: "sf:mb-9",
      10: "sf:mb-10",
      11: "sf:mb-11",
      12: "sf:mb-12",
      14: "sf:mb-14",
      16: "sf:mb-16",
      20: "sf:mb-20",
      24: "sf:mb-24",
      28: "sf:mb-28",
      32: "sf:mb-32",
      36: "sf:mb-36",
      40: "sf:mb-40",
      44: "sf:mb-44",
      48: "sf:mb-48",
      52: "sf:mb-52",
      56: "sf:mb-56",
      60: "sf:mb-60",
      64: "sf:mb-64",
      72: "sf:mb-72",
      80: "sf:mb-80",
      96: "sf:mb-96",
      auto: "sf:mb-auto",
      xs: "sf:mb-2",
      sm: "sf:mb-4",
      md: "sf:mb-6",
      lg: "sf:mb-8",
      xl: "sf:mb-10",
      "2xl": "sf:mb-12",
      "3xl": "sf:mb-16",
      "4xl": "sf:mb-20",
      "5xl": "sf:mb-24",
      "6xl": "sf:mb-32",
      "7xl": "sf:mb-40",
    },
    mr: {
      0: "sf:mr-0",
      px: "sf:mr-px",
      0.5: "sf:mr-0.5",
      1: "sf:mr-1",
      1.5: "sf:mr-1.5",
      2: "sf:mr-2",
      2.5: "sf:mr-2.5",
      3: "sf:mr-3",
      3.5: "sf:mr-3.5",
      4: "sf:mr-4",
      5: "sf:mr-5",
      6: "sf:mr-6",
      7: "sf:mr-7",
      8: "sf:mr-8",
      9: "sf:mr-9",
      10: "sf:mr-10",
      11: "sf:mr-11",
      12: "sf:mr-12",
      14: "sf:mr-14",
      16: "sf:mr-16",
      20: "sf:mr-20",
      24: "sf:mr-24",
      28: "sf:mr-28",
      32: "sf:mr-32",
      36: "sf:mr-36",
      40: "sf:mr-40",
      44: "sf:mr-44",
      48: "sf:mr-48",
      52: "sf:mr-52",
      56: "sf:mr-56",
      60: "sf:mr-60",
      64: "sf:mr-64",
      72: "sf:mr-72",
      80: "sf:mr-80",
      96: "sf:mr-96",
      auto: "sf:mr-auto",
      xs: "sf:mr-2",
      sm: "sf:mr-4",
      md: "sf:mr-6",
      lg: "sf:mr-8",
      xl: "sf:mr-10",
      "2xl": "sf:mr-12",
      "3xl": "sf:mr-16",
      "4xl": "sf:mr-20",
      "5xl": "sf:mr-24",
      "6xl": "sf:mr-32",
      "7xl": "sf:mr-40",
    },
    ml: {
      0: "sf:ml-0",
      px: "sf:ml-px",
      0.5: "sf:ml-0.5",
      1: "sf:ml-1",
      1.5: "sf:ml-1.5",
      2: "sf:ml-2",
      2.5: "sf:ml-2.5",
      3: "sf:ml-3",
      3.5: "sf:ml-3.5",
      4: "sf:ml-4",
      5: "sf:ml-5",
      6: "sf:ml-6",
      7: "sf:ml-7",
      8: "sf:ml-8",
      9: "sf:ml-9",
      10: "sf:ml-10",
      11: "sf:ml-11",
      12: "sf:ml-12",
      14: "sf:ml-14",
      16: "sf:ml-16",
      20: "sf:ml-20",
      24: "sf:ml-24",
      28: "sf:ml-28",
      32: "sf:ml-32",
      36: "sf:ml-36",
      40: "sf:ml-40",
      44: "sf:ml-44",
      48: "sf:ml-48",
      52: "sf:ml-52",
      56: "sf:ml-56",
      60: "sf:ml-60",
      64: "sf:ml-64",
      72: "sf:ml-72",
      80: "sf:ml-80",
      96: "sf:ml-96",
      auto: "sf:ml-auto",
      xs: "sf:ml-2",
      sm: "sf:ml-4",
      md: "sf:ml-6",
      lg: "sf:ml-8",
      xl: "sf:ml-10",
      "2xl": "sf:ml-12",
      "3xl": "sf:ml-16",
      "4xl": "sf:ml-20",
      "5xl": "sf:ml-24",
      "6xl": "sf:ml-32",
      "7xl": "sf:ml-40",
    },
    // Width and Height
    width: {
      auto: "sf:w-auto",
      full: "sf:w-full",
      screen: "sf:w-screen",
      min: "sf:w-min",
      max: "sf:w-max",
      fit: "sf:w-fit",
      xs: "sf:w-4",
      sm: "sf:w-8",
      md: "sf:w-12",
      lg: "sf:w-16",
      xl: "sf:w-20",
      "2xl": "sf:w-24",
      "3xl": "sf:w-32",
      "4xl": "sf:w-40",
      "5xl": "sf:w-48",
      "6xl": "sf:w-64",
      "7xl": "sf:w-80",
      "1/2": "sf:w-1/2",
      "1/3": "sf:w-1/3",
      "2/3": "sf:w-2/3",
      "1/4": "sf:w-1/4",
      "3/4": "sf:w-3/4",
      "1/5": "sf:w-1/5",
      "2/5": "sf:w-2/5",
      "3/5": "sf:w-3/5",
      "4/5": "sf:w-4/5",
      "1/6": "sf:w-1/6",
      "5/6": "sf:w-5/6",
      "1/12": "sf:w-1/12",
      "5/12": "sf:w-5/12",
      "7/12": "sf:w-7/12",
      "11/12": "sf:w-11/12",
      1: "sf:w-1",
      2: "sf:w-2",
      4: "sf:w-4",
      8: "sf:w-8",
      12: "sf:w-12",
      16: "sf:w-16",
      20: "sf:w-20",
      24: "sf:w-24",
      28: "sf:w-28",
      32: "sf:w-32",
      36: "sf:w-36",
      40: "sf:w-40",
      48: "sf:w-48",
      56: "sf:w-56",
      64: "sf:w-64",
      72: "sf:w-72",
      80: "sf:w-80",
      96: "sf:w-96",
    },
    height: {
      auto: "sf:h-auto",
      full: "sf:h-full",
      screen: "sf:h-screen",
      min: "sf:h-min",
      max: "sf:h-max",
      fit: "sf:h-fit",
      xs: "sf:h-4",
      sm: "sf:h-8",
      md: "sf:h-12",
      lg: "sf:h-16",
      xl: "sf:h-20",
      "2xl": "sf:h-24",
      "3xl": "sf:h-32",
      "4xl": "sf:h-40",
      "5xl": "sf:h-48",
      "6xl": "sf:h-64",
      "7xl": "sf:h-80",
      "1/2": "sf:h-1/2",
      "1/3": "sf:h-1/3",
      "2/3": "sf:h-2/3",
      "1/4": "sf:h-1/4",
      "3/4": "sf:h-3/4",
      "1/5": "sf:h-1/5",
      "2/5": "sf:h-2/5",
      "3/5": "sf:h-3/5",
      "4/5": "sf:h-4/5",
      "1/6": "sf:h-1/6",
      1: "sf:h-1",
      2: "sf:h-2",
      4: "sf:h-4",
      8: "sf:h-8",
      12: "sf:h-12",
      16: "sf:h-16",
      20: "sf:h-20",
      24: "sf:h-24",
      28: "sf:h-28",
      32: "sf:h-32",
      36: "sf:h-36",
      40: "sf:h-40",
      48: "sf:h-48",
      56: "sf:h-56",
      64: "sf:h-64",
      72: "sf:h-72",
      80: "sf:h-80",
      96: "sf:h-96",
    },
    // Other visual properties
    maxWidth: {
      none: "sf:max-w-none",
      xs: "sf:max-w-xs",
      sm: "sf:max-w-sm",
      md: "sf:max-w-md",
      lg: "sf:max-w-lg",
      xl: "sf:max-w-xl",
      "2xl": "sf:max-w-2xl",
      "3xl": "sf:max-w-3xl",
      "4xl": "sf:max-w-4xl",
      "5xl": "sf:max-w-5xl",
      "6xl": "sf:max-w-6xl",
      "7xl": "sf:max-w-7xl",
      full: "sf:max-w-full",
      min: "sf:max-w-min",
      max: "sf:max-w-max",
      fit: "sf:max-w-fit",
      prose: "sf:max-w-prose",
      "screen-sm": "sf:max-w-screen-sm",
      "screen-md": "sf:max-w-screen-md",
      "screen-lg": "sf:max-w-screen-lg",
      "screen-xl": "sf:max-w-screen-xl",
      "screen-2xl": "sf:max-w-screen-2xl",
    },
    minWidth: {
      0: "sf:min-w-0",
      full: "sf:min-w-full",
      min: "sf:min-w-min",
      max: "sf:min-w-max",
      fit: "sf:min-w-fit",
      xs: "sf:min-w-[20rem]",
      sm: "sf:min-w-[24rem]",
      md: "sf:min-w-[28rem]",
      lg: "sf:min-w-[32rem]",
      xl: "sf:min-w-[36rem]",
      "2xl": "sf:min-w-[42rem]",
      "3xl": "sf:min-w-[48rem]",
      "4xl": "sf:min-w-[56rem]",
      "5xl": "sf:min-w-[64rem]",
      "6xl": "sf:min-w-[72rem]",
      "7xl": "sf:min-w-[80rem]",
    },
    maxHeight: {
      none: "sf:max-h-none",
      xs: "sf:max-h-[20rem]",
      sm: "sf:max-h-[24rem]",
      md: "sf:max-h-[28rem]",
      lg: "sf:max-h-[32rem]",
      xl: "sf:max-h-[36rem]",
      "2xl": "sf:max-h-[42rem]",
      "3xl": "sf:max-h-[48rem]",
      "4xl": "sf:max-h-[56rem]",
      "5xl": "sf:max-h-[64rem]",
      "6xl": "sf:max-h-[72rem]",
      "7xl": "sf:max-h-[80rem]",
      full: "sf:max-h-full",
      screen: "sf:max-h-screen",
    },
    minHeight: {
      0: "sf:min-h-0",
      full: "sf:min-h-full",
      screen: "sf:min-h-screen",
      min: "sf:min-h-min",
      max: "sf:min-h-max",
      fit: "sf:min-h-fit",
      xs: "sf:min-h-[20rem]",
      sm: "sf:min-h-[24rem]",
      md: "sf:min-h-[28rem]",
      lg: "sf:min-h-[32rem]",
      xl: "sf:min-h-[36rem]",
      "2xl": "sf:min-h-[42rem]",
      "3xl": "sf:min-h-[48rem]",
      "4xl": "sf:min-h-[56rem]",
      "5xl": "sf:min-h-[64rem]",
      "6xl": "sf:min-h-[72rem]",
      "7xl": "sf:min-h-[80rem]",
    },
    // Visual styling
    bg: {
      transparent: "sf:bg-transparent",
      current: "sf:bg-current",
      background: "sf:bg-background",
      foreground: "sf:bg-foreground",
      primary: "sf:bg-primary",
      "primary-foreground": "sf:bg-primary-foreground",
      secondary: "sf:bg-secondary",
      "secondary-foreground": "sf:bg-secondary-foreground",
      muted: "sf:bg-muted",
      "muted-foreground": "sf:bg-muted-foreground",
      accent: "sf:bg-accent",
      "accent-foreground": "sf:bg-accent-foreground",
      destructive: "sf:bg-destructive",
      "destructive-foreground": "sf:bg-destructive-foreground",
      success: "sf:bg-green-500",
      warning: "sf:bg-amber-500",
      info: "sf:bg-blue-500",
    },
    border: {
      none: "sf:border-0",
      default: "sf:border",
      2: "sf:border-2",
      4: "sf:border-4",
      8: "sf:border-8",
    },
    borderColor: {
      transparent: "sf:border-transparent",
      current: "sf:border-current",
      border: "sf:border-border",
      input: "sf:border-input",
      primary: "sf:border-primary",
      secondary: "sf:border-secondary",
      muted: "sf:border-muted",
      accent: "sf:border-accent",
      destructive: "sf:border-destructive",
      success: "sf:border-green-500",
      warning: "sf:border-amber-500",
      info: "sf:border-blue-500",
    },
    rounded: {
      none: "sf:rounded-none",
      sm: "sf:rounded-sm",
      default: "sf:rounded",
      md: "sf:rounded-md",
      lg: "sf:rounded-lg",
      xl: "sf:rounded-xl",
      "2xl": "sf:rounded-2xl",
      "3xl": "sf:rounded-3xl",
      full: "sf:rounded-full",
    },
    shadow: {
      none: "sf:shadow-none",
      sm: "sf:shadow-sm",
      default: "sf:shadow",
      md: "sf:shadow-md",
      lg: "sf:shadow-lg",
      xl: "sf:shadow-xl",
      "2xl": "sf:shadow-2xl",
      inner: "sf:shadow-inner",
    },
    // Other utilities
    overflow: {
      auto: "sf:overflow-auto",
      hidden: "sf:overflow-hidden",
      visible: "sf:overflow-visible",
      scroll: "sf:overflow-scroll",
    },
    zIndex: {
      0: "sf:z-0",
      10: "sf:z-10",
      20: "sf:z-20",
      30: "sf:z-30",
      40: "sf:z-40",
      50: "sf:z-50",
      auto: "sf:z-auto",
    },
    opacity: {
      0: "sf:opacity-0",
      25: "sf:opacity-25",
      50: "sf:opacity-50",
      75: "sf:opacity-75",
      100: "sf:opacity-100",
    },
  },
  defaultVariants: {
    display: "block",
  },
  compoundVariants: [
    // Apply flex properties only when display is flex or inline-flex
    {
      display: ["flex", "inlineFlex"],
      direction: "row",
      className: "sf:flex-row",
    },
    {
      display: ["flex", "inlineFlex"],
      wrap: "wrap",
      className: "sf:flex-wrap",
    },
    // Apply grid properties only when display is grid or inline-grid
    {
      display: ["grid", "inlineGrid"],
      className: "sf:grid",
    },
  ],
});

// Define responsive value type that allows both direct values and responsive objects
export type ResponsiveValue<T> =
  | T
  | {
      base?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      "2xl"?: T;
    };

// Box props interface with proper responsive handling
export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  id?: string;
  role?: string;
  animate?: boolean;
  hoverStyles?: string;
  focusStyles?: string;
  activeStyles?: string;

  // Layout
  display?: ResponsiveValue<VariantProps<typeof boxVariants>["display"]>;
  position?: ResponsiveValue<VariantProps<typeof boxVariants>["position"]>;

  // Flex & Grid
  direction?: ResponsiveValue<VariantProps<typeof boxVariants>["direction"]>;
  align?: ResponsiveValue<VariantProps<typeof boxVariants>["align"]>;
  justify?: ResponsiveValue<VariantProps<typeof boxVariants>["justify"]>;
  wrap?: ResponsiveValue<VariantProps<typeof boxVariants>["wrap"]>;
  gap?: ResponsiveValue<VariantProps<typeof boxVariants>["gap"]>;

  // Padding
  p?: ResponsiveValue<VariantProps<typeof boxVariants>["p"]>;
  px?: ResponsiveValue<VariantProps<typeof boxVariants>["px"]>;
  py?: ResponsiveValue<VariantProps<typeof boxVariants>["py"]>;
  pt?: ResponsiveValue<VariantProps<typeof boxVariants>["pt"]>;
  pb?: ResponsiveValue<VariantProps<typeof boxVariants>["pb"]>;
  pr?: ResponsiveValue<VariantProps<typeof boxVariants>["pr"]>;
  pl?: ResponsiveValue<VariantProps<typeof boxVariants>["pl"]>;

  // Margin
  m?: ResponsiveValue<VariantProps<typeof boxVariants>["m"]>;
  mx?: ResponsiveValue<VariantProps<typeof boxVariants>["mx"]>;
  my?: ResponsiveValue<VariantProps<typeof boxVariants>["my"]>;
  mt?: ResponsiveValue<VariantProps<typeof boxVariants>["mt"]>;
  mb?: ResponsiveValue<VariantProps<typeof boxVariants>["mb"]>;
  mr?: ResponsiveValue<VariantProps<typeof boxVariants>["mr"]>;
  ml?: ResponsiveValue<VariantProps<typeof boxVariants>["ml"]>;

  // Width and Height
  width?: ResponsiveValue<VariantProps<typeof boxVariants>["width"]>;
  height?: ResponsiveValue<VariantProps<typeof boxVariants>["height"]>;
  maxWidth?: ResponsiveValue<VariantProps<typeof boxVariants>["maxWidth"]>;
  minWidth?: ResponsiveValue<VariantProps<typeof boxVariants>["minWidth"]>;
  maxHeight?: ResponsiveValue<VariantProps<typeof boxVariants>["maxHeight"]>;
  minHeight?: ResponsiveValue<VariantProps<typeof boxVariants>["minHeight"]>;

  // Visual styling
  bg?: ResponsiveValue<VariantProps<typeof boxVariants>["bg"]>;
  border?: ResponsiveValue<VariantProps<typeof boxVariants>["border"]>;
  borderColor?: ResponsiveValue<
    VariantProps<typeof boxVariants>["borderColor"]
  >;
  rounded?: ResponsiveValue<VariantProps<typeof boxVariants>["rounded"]>;
  shadow?: ResponsiveValue<VariantProps<typeof boxVariants>["shadow"]>;

  // Other utilities
  overflow?: ResponsiveValue<VariantProps<typeof boxVariants>["overflow"]>;
  zIndex?: ResponsiveValue<VariantProps<typeof boxVariants>["zIndex"]>;
  opacity?: ResponsiveValue<VariantProps<typeof boxVariants>["opacity"]>;

  // Grid specific properties
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  gridAutoFlow?: string;
  gridAutoColumns?: string;
  gridAutoRows?: string;

  // Legacy support for responsive object
  responsive?: {
    base?: Partial<Omit<BoxProps, "responsive" | "as">>;
    sm?: Partial<Omit<BoxProps, "responsive" | "as">>;
    md?: Partial<Omit<BoxProps, "responsive" | "as">>;
    lg?: Partial<Omit<BoxProps, "responsive" | "as">>;
    xl?: Partial<Omit<BoxProps, "responsive" | "as">>;
    "2xl"?: Partial<Omit<BoxProps, "responsive" | "as">>;
  };
}

/**
 * Box component - A versatile layout primitive for consistent UI construction
 *
 * @example
 * // Basic usage
 * <Box p={4} rounded="lg" shadow="md" bg="background">Content</Box>
 *
 * @example
 * // Responsive props
 * <Box p={{ base: 4, md: 6, lg: 8 }} bg={{ base: "muted", lg: "accent" }}>
 *   Responsive Box
 * </Box>
 */
export const Box = memo(
  forwardRef<HTMLDivElement, BoxProps>(
    (
      {
        as,
        className,
        children,
        display,
        position,
        direction,
        align,
        justify,
        wrap,
        gap,
        p,
        px,
        py,
        m,
        mx,
        my,
        width,
        height,
        maxWidth,
        minWidth,
        maxHeight,
        minHeight,
        bg,
        border,
        borderColor,
        rounded,
        shadow,
        overflow,
        zIndex,
        opacity,
        hoverStyles,
        focusStyles,
        activeStyles,
        animate,
        responsive,
        gridTemplateColumns,
        gridTemplateRows,
        gridColumn,
        gridRow,
        gridAutoFlow,
        gridAutoColumns,
        gridAutoRows,
        ...props
      },
      ref,
    ) => {
      const Component = as || "div";

      // Extract non-responsive variant props
      const standardProps: Record<string, any> = {};
      const responsiveProps: Record<string, Record<string, any>> = {};

      // Sort props into standard vs responsive
      Object.entries({
        display,
        position,
        direction,
        align,
        justify,
        wrap,
        gap,
        p,
        px,
        py,
        m,
        mx,
        my,
        width,
        height,
        maxWidth,
        minWidth,
        maxHeight,
        minHeight,
        bg,
        border,
        borderColor,
        rounded,
        shadow,
        overflow,
        zIndex,
        opacity,
      }).forEach(([key, value]) => {
        if (value !== undefined) {
          if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
          ) {
            // This is a responsive value
            Object.entries(value).forEach(([breakpoint, breakpointValue]) => {
              if (!responsiveProps[breakpoint]) {
                responsiveProps[breakpoint] = {};
              }
              responsiveProps[breakpoint][key] = breakpointValue;
            });
          } else {
            // This is a standard value
            standardProps[key] = value;
          }
        }
      });

      // Handle direct grid props outside of variants
      const gridProps: Record<string, string> = {};
      if (gridTemplateColumns)
        gridProps.gridTemplateColumns = gridTemplateColumns;
      if (gridTemplateRows) gridProps.gridTemplateRows = gridTemplateRows;
      if (gridColumn) gridProps.gridColumn = gridColumn;
      if (gridRow) gridProps.gridRow = gridRow;
      if (gridAutoFlow) gridProps.gridAutoFlow = gridAutoFlow;
      if (gridAutoColumns) gridProps.gridAutoColumns = gridAutoColumns;
      if (gridAutoRows) gridProps.gridAutoRows = gridAutoRows;

      // Handle animation
      const animationClass = animate
        ? "sf:transition-all sf:duration-300 sf:ease-in-out"
        : "";

      // Handle interaction styles
      const interactionClasses = [
        hoverStyles ? `hover:${hoverStyles}` : "",
        focusStyles ? `focus:${focusStyles}` : "",
        activeStyles ? `active:${activeStyles}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      // Process standard variants
      const variantClasses = boxVariants(standardProps as any);

      // Build responsive classes
      const responsiveClasses: string[] = [];

      // Process the sorted responsive props
      Object.entries(responsiveProps).forEach(
        ([breakpoint, breakpointProps]) => {
          // For base breakpoint, don't add a prefix
          const prefix = breakpoint === "base" ? "" : `${breakpoint}:`;

          // Get variant classes for this breakpoint's props
          try {
            const breakpointClasses = boxVariants(breakpointProps as any);
            if (breakpointClasses) {
              (Array.isArray(breakpointClasses)
                ? breakpointClasses
                : [breakpointClasses]
              )
                .filter(Boolean)
                .forEach((cls) => {
                  if (typeof cls === "string") {
                    responsiveClasses.push(`${prefix}${cls}`);
                  }
                });
            }
          } catch (err) {
            if (process.env.NODE_ENV === "development") {
              console.warn(
                `Error processing responsive props for breakpoint ${breakpoint}:`,
                err,
              );
            }
          }
        },
      );

      // Process the responsive object if provided
      if (responsive) {
        Object.entries(responsive).forEach(([breakpoint, breakpointProps]) => {
          // For base breakpoint, don't add a prefix
          const prefix = breakpoint === "base" ? "" : `${breakpoint}:`;

          // Get variant classes for this breakpoint's props
          try {
            const breakpointClasses = boxVariants(breakpointProps as any);
            if (breakpointClasses) {
              (Array.isArray(breakpointClasses)
                ? breakpointClasses
                : [breakpointClasses]
              )
                .filter(Boolean)
                .forEach((cls) => {
                  if (typeof cls === "string") {
                    responsiveClasses.push(`${prefix}${cls}`);
                  }
                });
            }
          } catch (err) {
            if (process.env.NODE_ENV === "development") {
              console.warn(
                `Error processing responsive props for breakpoint ${breakpoint}:`,
                err,
              );
            }
          }
        });
      }

      return (
        <Component
          ref={ref}
          className={cn(
            variantClasses,
            animationClass,
            interactionClasses,
            responsiveClasses.join(" "),
            className,
          )}
          style={Object.keys(gridProps).length > 0 ? gridProps : undefined}
          {...props}
        >
          {children}
        </Component>
      );
    },
  ),
);

Box.displayName = "Box";

/**
 * Container - A centered, width-constrained Box with responsive padding
 */
export const Container = memo(
  forwardRef<HTMLDivElement, Omit<BoxProps, "mx" | "maxWidth">>(
    (props, ref) => (
      <Box
        ref={ref}
        mx="auto"
        px={4}
        width="full"
        maxWidth="7xl"
        responsive={{
          lg: { px: 6 },
        }}
        {...props}
      />
    ),
  ),
);
Container.displayName = "Container";

/**
 * Flex - A convenience component for flex layouts
 */
export const Flex = memo(
  forwardRef<HTMLDivElement, Omit<BoxProps, "display">>((props, ref) => (
    <Box ref={ref} display="flex" {...props} />
  )),
);
Flex.displayName = "Flex";

/**
 * Grid - A convenience component for grid layouts
 */
export const Grid = memo(
  forwardRef<HTMLDivElement, Omit<BoxProps, "display">>((props, ref) => (
    <Box ref={ref} display="grid" {...props} />
  )),
);
Grid.displayName = "Grid";

/**
 * Card - A pre-styled Box for card layouts
 */
export const Card = memo(
  forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
    <Box
      ref={ref}
      p={5}
      bg="background"
      border="default"
      borderColor="border"
      rounded="lg"
      shadow="md"
      overflow="hidden"
      {...props}
    />
  )),
);
Card.displayName = "Card";

/**
 * Divider - A horizontal or vertical separator line
 */
export const Divider = memo(
  forwardRef<
    HTMLDivElement,
    BoxProps & { orientation?: "horizontal" | "vertical" }
  >(({ orientation = "horizontal", className, ...props }, ref) => (
    <Box
      ref={ref}
      className={cn(
        orientation === "horizontal"
          ? "sf:w-full sf:h-px"
          : "sf:h-full sf:w-px",
        className,
      )}
      bg="muted"
      my={orientation === "horizontal" ? 4 : 0}
      mx={orientation === "vertical" ? 4 : 0}
      {...props}
    />
  )),
);
Divider.displayName = "Divider";
