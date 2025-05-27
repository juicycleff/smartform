import React, { HTMLAttributes, forwardRef, memo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Box, BoxProps } from "./box"; // Import the Box component

/**
 * Heading component for displaying titles and section headers
 * Supports h1-h6 sizes with responsive scaling and custom element types
 * @example
 * <Heading size="h1">Page Title</Heading>
 * <Heading size="h3" color="muted">Section Header</Heading>
 */
const headingVariants = cva(
  "sf:font-heading sf:leading-tight sf:tracking-tight",
  {
    variants: {
      size: {
        h1: "sf:text-4xl md:sf:text-5xl lg:sf:text-6xl sf:font-bold",
        h2: "sf:text-3xl md:sf:text-4xl sf:font-bold",
        h3: "sf:text-2xl md:sf:text-3xl sf:font-semibold",
        h4: "sf:text-xl md:sf:text-2xl sf:font-semibold",
        h5: "sf:text-lg md:sf:text-xl sf:font-medium",
        h6: "sf:text-base md:sf:text-lg sf:font-medium",
      },
      color: {
        default: "sf:text-foreground",
        muted: "sf:text-muted-foreground",
        accent: "sf:text-primary",
        success: "sf:text-green-600 dark:sf:text-green-500",
        warning: "sf:text-amber-600 dark:sf:text-amber-500",
        error: "sf:text-red-600 dark:sf:text-red-500",
      },
      align: {
        left: "sf:text-left",
        center: "sf:text-center",
        right: "sf:text-right",
      },
    },
    defaultVariants: {
      size: "h1",
      color: "default",
      align: "left",
    },
  },
);

/**
 * Paragraph component for displaying body text in various sizes
 * Supports different weights, colors, and text overflow handling
 * @example
 * <Paragraph size="medium">Standard paragraph text</Paragraph>
 * <Paragraph size="small" color="muted" truncate>Truncated text with ellipsis</Paragraph>
 */
const paragraphVariants = cva("sf:font-body", {
  variants: {
    size: {
      large: "sf:text-lg sf:leading-relaxed",
      medium: "sf:text-base sf:leading-relaxed",
      small: "sf:text-sm sf:leading-normal",
      xs: "sf:text-xs sf:leading-normal",
    },
    weight: {
      regular: "sf:font-normal",
      medium: "sf:font-medium",
      semibold: "sf:font-semibold",
      bold: "sf:font-bold",
    },
    color: {
      default: "sf:text-foreground",
      muted: "sf:text-muted-foreground",
      accent: "sf:text-primary",
      success: "sf:text-green-600 dark:sf:text-green-500",
      warning: "sf:text-amber-600 dark:sf:text-amber-500",
      error: "sf:text-red-600 dark:sf:text-red-500",
    },
    align: {
      left: "sf:text-left",
      center: "sf:text-center",
      right: "sf:text-right",
      justify: "sf:text-justify",
    },
    font: {
      sans: "sf:font-sans",
      serif: "sf:font-serif",
      mono: "sf:font-mono",
    },
    truncate: {
      true: "sf:truncate",
    },
    lineClamp: {
      1: "sf:line-clamp-1",
      2: "sf:line-clamp-2",
      3: "sf:line-clamp-3",
      4: "sf:line-clamp-4",
    },
  },
  defaultVariants: {
    size: "medium",
    weight: "regular",
    color: "default",
    align: "left",
    font: "sans",
  },
  compoundVariants: [
    {
      truncate: true,
      className: "sf:overflow-hidden sf:text-ellipsis sf:whitespace-nowrap",
    },
  ],
});

/**
 * Label component for interface labels, form fields, and short text elements
 * @example
 * <Label size="1" htmlFor="email">Email Address</Label>
 * <Label size="3" color="error">Required field</Label>
 */
const labelVariants = cva("sf:font-display", {
  variants: {
    size: {
      "1": "sf:text-lg sf:font-medium sf:leading-snug",
      "2": "sf:text-base sf:font-medium sf:leading-snug",
      "3": "sf:text-sm sf:font-medium sf:leading-snug",
      "4": "sf:text-xs sf:font-medium sf:leading-tight",
    },
    weight: {
      regular: "sf:font-normal",
      medium: "sf:font-medium",
      semibold: "sf:font-semibold",
      bold: "sf:font-bold",
    },
    color: {
      default: "sf:text-foreground",
      muted: "sf:text-muted-foreground",
      accent: "sf:text-primary",
      success: "sf:text-green-600 dark:sf:text-green-500",
      warning: "sf:text-amber-600 dark:sf:text-amber-500",
      error: "sf:text-red-600 dark:sf:text-red-500",
    },
    required: {
      true: "after:sf:content-['*'] after:sf:ml-0.5 after:sf:text-red-500",
    },
    srOnly: {
      true: "sf:sr-only",
    },
  },
  defaultVariants: {
    size: "2",
    weight: "medium",
    color: "default",
  },
});

/**
 * Caption component for supplementary text, image descriptions, and metadata
 * @example
 * <Caption>Photo taken in 2023</Caption>
 * <Caption size="small" color="muted">Last updated: Yesterday</Caption>
 */
const captionVariants = cva("sf:font-mono", {
  variants: {
    size: {
      default: "sf:text-sm",
      small: "sf:text-xs",
    },
    color: {
      default: "sf:text-foreground",
      muted: "sf:text-muted-foreground",
      accent: "sf:text-primary",
      success: "sf:text-green-600 dark:sf:text-green-500",
      warning: "sf:text-amber-600 dark:sf:text-amber-500",
      error: "sf:text-red-600 dark:sf:text-red-500",
    },
    align: {
      left: "sf:text-left",
      center: "sf:text-center",
      right: "sf:text-right",
    },
  },
  defaultVariants: {
    size: "default",
    color: "muted",
    align: "left",
  },
});

// Common props shared across all typography components - extended from BoxProps
export interface BaseTypographyProps extends Omit<BoxProps, "color"> {
  color?: "default" | "muted" | "accent" | "success" | "warning" | "error";
}

// Heading specific props
export interface HeadingProps
  extends Omit<BaseTypographyProps, "align">,
    Omit<VariantProps<typeof headingVariants>, "color"> {
  align?: "left" | "center" | "right";
}

// Paragraph specific props
export interface ParagraphProps
  extends Omit<BaseTypographyProps, "align">,
    Omit<VariantProps<typeof paragraphVariants>, "color"> {
  weight?: "regular" | "medium" | "semibold" | "bold";
  align?: "left" | "center" | "right" | "justify";
  font?: "sans" | "serif" | "mono";
  truncate?: boolean;
  lineClamp?: 1 | 2 | 3 | 4;
}

// Label specific props
export interface LabelProps
  extends BaseTypographyProps,
    Omit<VariantProps<typeof labelVariants>, "color"> {
  weight?: "regular" | "medium" | "semibold" | "bold";
  required?: boolean;
  srOnly?: boolean;
}

// Caption specific props
export interface CaptionProps
  extends Omit<BaseTypographyProps, "align">,
    Omit<VariantProps<typeof captionVariants>, "color"> {
  align?: "left" | "center" | "right";
}

// Animation wrapper for typography components
const withFadeAnimation = <P extends BaseTypographyProps>(
  Component: React.ComponentType<P>,
) => {
  return forwardRef<HTMLElement, P & { animate?: boolean }>(
    ({ animate, ...props }, ref) => {
      return (
        <Component ref={ref} animate={animate} {...(props as unknown as P)} />
      );
    },
  );
};

// Heading Components
export const Heading = memo(
  forwardRef<HTMLHeadingElement, HeadingProps>(
    ({ className, size, color, align, as, children, ...props }, ref) => {
      const Component =
        as ||
        (size === "h1"
          ? "h1"
          : size === "h2"
            ? "h2"
            : size === "h3"
              ? "h3"
              : size === "h4"
                ? "h4"
                : size === "h5"
                  ? "h5"
                  : "h6");

      // Accessibility improvement for non-standard heading elements
      const ariaProps =
        as && ["h1", "h2", "h3", "h4", "h5", "h6"].includes(String(size))
          ? { role: "heading", "aria-level": Number(String(size).substring(1)) }
          : {};

      return (
        <Box
          as={Component}
          ref={ref}
          className={cn(headingVariants({ size, color, align, className }))}
          {...ariaProps}
          {...props}
        >
          {children}
        </Box>
      );
    },
  ),
);
Heading.displayName = "Heading";

// Paragraph Components
export const Paragraph = memo(
  forwardRef<HTMLParagraphElement, ParagraphProps>(
    (
      {
        className,
        size,
        weight,
        color,
        align,
        font,
        truncate,
        lineClamp,
        as = "p",
        children,
        ...props
      },
      ref,
    ) => {
      // Warning for incompatible props in development
      if (process.env.NODE_ENV === "development" && truncate && lineClamp) {
        console.warn(
          "Typography: Both truncate and lineClamp props are set. truncate will take precedence.",
        );
      }

      return (
        <Box
          as={as}
          ref={ref}
          className={cn(
            paragraphVariants({
              size,
              weight,
              color,
              align,
              font,
              truncate,
              lineClamp,
              className,
            }),
          )}
          dir={props.dir}
          {...props}
        >
          {children}
        </Box>
      );
    },
  ),
);
Paragraph.displayName = "Paragraph";

// Pre-configured Paragraph components
export const ParagraphLarge = memo(
  forwardRef<HTMLParagraphElement, Omit<ParagraphProps, "size">>(
    (props, ref) => <Paragraph ref={ref} size="large" {...props} />,
  ),
);
ParagraphLarge.displayName = "ParagraphLarge";

export const ParagraphMedium = memo(
  forwardRef<HTMLParagraphElement, Omit<ParagraphProps, "size">>(
    (props, ref) => <Paragraph ref={ref} size="medium" {...props} />,
  ),
);
ParagraphMedium.displayName = "ParagraphMedium";

export const ParagraphSmall = memo(
  forwardRef<HTMLParagraphElement, Omit<ParagraphProps, "size">>(
    (props, ref) => <Paragraph ref={ref} size="small" {...props} />,
  ),
);
ParagraphSmall.displayName = "ParagraphSmall";

export const ParagraphXS = memo(
  forwardRef<HTMLParagraphElement, Omit<ParagraphProps, "size">>(
    (props, ref) => <Paragraph ref={ref} size="xs" {...props} />,
  ),
);
ParagraphXS.displayName = "ParagraphXS";

// Label Components
export const Label = memo(
  forwardRef<HTMLSpanElement, LabelProps>(
    (
      {
        className,
        size,
        weight,
        color,
        required,
        srOnly,
        as = "span",
        children,
        ...props
      },
      ref,
    ) => {
      return (
        <Box
          as={as}
          ref={ref as any}
          className={cn(
            labelVariants({ size, weight, color, required, srOnly, className }),
          )}
          {...props}
        >
          {children}
        </Box>
      );
    },
  ),
);
Label.displayName = "Label";

// Pre-configured Label components
export const Label1 = memo(
  forwardRef<HTMLSpanElement, Omit<LabelProps, "size">>((props, ref) => (
    <Label ref={ref} size="1" {...props} />
  )),
);
Label1.displayName = "Label1";

export const Label2 = memo(
  forwardRef<HTMLSpanElement, Omit<LabelProps, "size">>((props, ref) => (
    <Label ref={ref} size="2" {...props} />
  )),
);
Label2.displayName = "Label2";

export const Label3 = memo(
  forwardRef<HTMLSpanElement, Omit<LabelProps, "size">>((props, ref) => (
    <Label ref={ref} size="3" {...props} />
  )),
);
Label3.displayName = "Label3";

export const Label4 = memo(
  forwardRef<HTMLSpanElement, Omit<LabelProps, "size">>((props, ref) => (
    <Label ref={ref} size="4" {...props} />
  )),
);
Label4.displayName = "Label4";

// Caption Component
export const Caption = memo(
  forwardRef<HTMLSpanElement, CaptionProps>(
    (
      { className, size, color, align, as = "span", children, ...props },
      ref,
    ) => {
      return (
        <Box
          as={as}
          ref={ref as any}
          className={cn(captionVariants({ size, color, align, className }))}
          {...props}
        >
          {children}
        </Box>
      );
    },
  ),
);
Caption.displayName = "Caption";

// Pre-configured Caption components
export const CaptionDefault = memo(
  forwardRef<HTMLSpanElement, Omit<CaptionProps, "size">>((props, ref) => (
    <Caption ref={ref} size="default" {...props} />
  )),
);
CaptionDefault.displayName = "CaptionDefault";

export const CaptionSmall = memo(
  forwardRef<HTMLSpanElement, Omit<CaptionProps, "size">>((props, ref) => (
    <Caption ref={ref} size="small" {...props} />
  )),
);
CaptionSmall.displayName = "CaptionSmall";

// Animated versions of components
export const AnimatedHeading = withFadeAnimation(Heading as any);
export const AnimatedParagraph = withFadeAnimation(Paragraph as any);
export const AnimatedLabel = withFadeAnimation(Label);
export const AnimatedCaption = withFadeAnimation(Caption as any);

// Helper function for screen reader only text
export const ScreenReaderText = memo(
  ({ children, ...props }: HTMLAttributes<HTMLSpanElement>) => (
    <Box as="span" className="sf:sr-only" {...props}>
      {children}
    </Box>
  ),
);
ScreenReaderText.displayName = "ScreenReaderText";

// RTL support helper
export const RTLText = memo(
  ({ children, ...props }: HTMLAttributes<HTMLSpanElement>) => (
    <Box as="span" dir="rtl" {...props}>
      {children}
    </Box>
  ),
);
RTLText.displayName = "RTLText";

export function Muted({
  children,
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      {...props}
      className={`sf:text-sm sf:text-muted-foreground ${className || ""}`}
    >
      {children}
    </p>
  );
}

export function H1({
  children,
  className,
  ...props
}: React.ComponentProps<"h1">) {
  return (
    <h1
      {...props}
      className={`sf:scroll-m-20 sf:text-4xl sf:font-extrabold sf:tracking-tight lg:sf:text-5xl ${className || ""}`}
    >
      {children}
    </h1>
  );
}

export function H2({
  children,
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h1
      {...props}
      className={`sf:scroll-m-20 sf:border-b sf:pb-2 sf:text-3xl sf:font-semibold sf:tracking-tight first:sf:mt-0 ${className || ""}`}
    >
      {children}
    </h1>
  );
}

export function H3({
  children,
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      {...props}
      className={`sf:scroll-m-20 sf:text-2xl sf:font-semibold sf:tracking-tight ${className || ""}`}
    >
      {children}
    </h3>
  );
}

export function H4({
  children,
  className,
  ...props
}: React.ComponentProps<"h4">) {
  return (
    <h4
      {...props}
      className={`sf:scroll-m-20 sf:text-xl sf:font-semibold sf:tracking-tight ${className || ""}`}
    >
      {children}
    </h4>
  );
}

export function P({
  children,
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      {...props}
      className={`sf:leading-7 [&:not(:first-child)]:sf:mt-6 ${className || ""}`}
    >
      {children}
    </p>
  );
}

export function Blockquote({
  children,
  className,
  ...props
}: React.ComponentProps<"blockquote">) {
  return (
    <blockquote
      {...props}
      className={`sf:mt-6 sf:border-l-2 sf:pl-6 sf:italic ${className || ""}`}
    >
      {children}
    </blockquote>
  );
}

export function Code({
  children,
  className,
  ...props
}: React.ComponentProps<"code">) {
  return (
    <code
      {...props}
      className={`sf:relative sf:rounded sf:bg-muted sf:px-[0.3rem] sf:py-[0.2rem] sf:font-mono sf:text-sm sf:font-semibold ${className || ""}`}
    >
      {children}
    </code>
  );
}

export function Lead({
  children,
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      {...props}
      className={`sf:text-xl sf:text-muted-foreground ${className || ""}`}
    >
      {children}
    </p>
  );
}

export function Large({
  children,
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p {...props} className={`sf:text-lg sf:font-semibold ${className || ""}`}>
      {children}
    </p>
  );
}

export function Small({
  children,
  className,
  ...props
}: React.ComponentProps<"small">) {
  return (
    <small
      {...props}
      className={`sf:text-sm sf:font-medium sf:leading-none ${className || ""}`}
    >
      {children}
    </small>
  );
}
