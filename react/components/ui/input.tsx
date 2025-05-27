import { animatedStyles, radiusStyles } from "../../lib/styles";
import { Label } from "./label";
import { cn } from "../../lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

export const inputContainerColorStyles = {
  primary: `
        sf:border-primary hover:not-focus-within:sf:primary/20 sf:focus-within:border-blue-600
        hover:sf:ring-blue-200 sf:focus-within:ring sf:focus-within:ring-blue-300
      `,
  secondary: `
        sf:border-gray-500 hover:sf:border-gray-600 sf:focus-within:border-gray-600
        hover:sf:ring-gray-200 sf:focus-within:ring sf:focus-within:ring-gray-300
      `,
  success: `
        sf:border-green-500 hover:not-focus-within:sf:border-green-600 sf:focus-within:border-green-600
        hover:sf:ring-green-200 sf:focus-within:ring sf:focus-within:ring-green-300
      `,
  warning: `
        sf:border-yellow-500 hover:not-focus-within:sf:border-yellow-600 sf:focus-within:border-yellow-600
        hover:sf:ring-yellow-200 sf:focus-within:ring sf:focus-within:ring-yellow-300
      `,
  error: `
        sf:border-red-500 hover:not-focus-within:sf:border-red-600 sf:focus-within:border-red-600
        hover:sf:ring-red-200 sf:focus-within:ring sf:focus-within:ring-red-300
      `,
  default: `
        sf:border-pyro-border-secondary hover:not-focus-within:sf:border-pyro-border-primary sf:focus-within:border-pyro-text-primary
        hover:sf:ring-gray-100 sf:focus-within:ring sf:focus-within:ring-gray-400
      `,
  tertiary: `
        sf:border-gray-200 hover:not-focus-within:sf:border-gray-300 sf:focus-within:border-gray-300
        hover:sf:ring-gray-100 sf:focus-within:ring sf:focus-within:ring-gray-200
      `,
  quaternary: `
        sf:border-gray-700 hover:not-focus-within:sf:border-gray-600 sf:focus-within:border-gray-600
        hover:sf:ring-gray-500 sf:focus-within:ring sf:focus-within:ring-gray-600
      `,
};

export const inputColorStyles = {
  primary: `
        sf:text-blue-600 placeholder:sf:text-blue-400
        sf:border-primary hover:not-focus-within:sf:border-primary/20 sf:focus-within:border-blue-600
        hover:sf:ring-blue-200 sf:focus-within:ring sf:focus-within:ring-blue-300
      `,
  secondary: `
        sf:text-gray-600 placeholder:sf:text-gray-400
        sf:border-gray-500 hover:sf:border-gray-600 sf:focus-within:border-gray-600
        hover:sf:ring-gray-200 sf:focus-within:ring sf:focus-within:ring-gray-300
      `,
  success: `
        sf:text-green-600 placeholder:sf:text-green-400
        sf:border-green-500 hover:not-focus-within:sf:border-green-600 sf:focus-within:border-green-600
        hover:sf:ring-green-200 sf:focus-within:ring sf:focus-within:ring-green-300
      `,
  warning: `
        sf:text-yellow-600 placeholder:sf:text-yellow-400
        sf:border-yellow-500 hover:not-focus-within:sf:border-yellow-600 sf:focus-within:border-yellow-600
        hover:sf:ring-yellow-200 sf:focus-within:ring sf:focus-within:ring-yellow-300
      `,
  error: `
        sf:text-red-600 placeholder:sf:text-red-400
        sf:border-red-500 hover:not-focus-within:sf:border-red-600 sf:focus-within:border-red-600
        hover:sf:ring-red-200 sf:focus-within:ring sf:focus-within:ring-red-300
      `,
  default: `
        sf:text-pyro-text-primary placeholder:sf:text-pyro-text-placeholder
        sf:border-pyro-border-secondary hover:not-focus-within:sf:border-pyro-border-primary sf:focus-within:border-pyro-text-primary
        sf:focus-within:ring-0
      `,
  tertiary: `
        sf:text-gray-700 placeholder:sf:text-gray-500
        sf:border-gray-200 hover:not-focus-within:sf:border-gray-300 sf:focus-within:border-gray-300
        hover:sf:ring-gray-100 sf:focus-within:ring sf:focus-within:ring-gray-200
      `,
  quaternary: `
        sf:text-gray-300 placeholder:sf:text-gray-500
        sf:border-gray-700 hover:not-focus-within:sf:border-gray-600 sf:focus-within:border-gray-600
        hover:sf:ring-gray-500 sf:focus-within:ring sf:focus-within:ring-gray-600
      `,
};

// Other utility-based styles
export const sizeStyles = {
  xs: "sf:h-8 sf:px-3 sf:py-1.5 sf:text-xs", // Smallest size: reduced padding and height for tight spacing
  sm: "sf:h-9 sf:px-3 sf:py-2 sf:text-sm", // Small but usable for most compact UIs
  md: "sf:h-10 sf:px-4 sf:py-2 sf:text-sm", // Default: Balanced size, text-aligns well for most uses
  lg: "sf:h-12 sf:px-4 sf:py-3 sf:text-base", // Larger: Comfortable for forms or inputs with more content
  xl: "sf:h-14 sf:px-6 sf:py-4 sf:text-lg", // Extra-large: Ideal for large forms, accessibility, or spacious UIs
};

// Other utility-based styles
export const minSizeStyles = {
  xs: "sf:min-h-8 sf:px-3 sf:py-1.5 sf:text-xs", // Smallest size: reduced padding and height for tight spacing
  sm: "sf:min-h-9 sf:px-3 sf:py-2 sf:text-sm", // Small but usable for most compact UIs
  md: "sf:min-h-10 sf:px-4 sf:py-2 sf:text-sm", // Default: Balanced size, text-aligns well for most uses
  lg: "sf:min-h-12 sf:px-4 sf:py-3 sf:text-base", // Larger: Comfortable for forms or inputs with more content
  xl: "sf:min-h-14 sf:px-6 sf:py-4 sf:text-lg", // Extra-large: Ideal for large forms, accessibility, or spacious UIs
};

export const inputSizeStyles = {
  xs: "sf:text-xs",
  sm: "sf:text-sm",
  default: "sf:text-md",
  md: "sf:text-md",
  lg: "sf:text-lg",
  xl: "sf:text-xl",
};

const baseStyles =
  "file:sf:text-foreground hover:!sf:ring-0 sf:focus-within:!ring-0 hover:!sf:outline-none sf:outline-none sf:focus-within:outline-none placeholder:sf:text-muted-foreground sf:selection:bg-primary sf:selection:text-primary-foreground sf:aria-invalid:border-destructive/60 dark:sf:aria-invalid:border-destructive sf:flex sf:w-full sf:bg-transparent file:sf:inline-flex file:sf:h-7 file:sf:border-0 file:sf:bg-transparent file:sf:text-sm file:sf:font-medium sf:disabled:pointer-events-none sf:disabled:cursor-not-allowed sf:disabled:opacity-50";

export const inputVariants = cva(baseStyles, {
  variants: {
    size: inputSizeStyles,
    fullWidth: {
      true: "sf:w-full sf:justify-center",
      false: "",
    },
    color: inputColorStyles,
    animated: animatedStyles,
  },
  defaultVariants: {
    size: "md",
    fullWidth: false,
    animated: false,
    color: "default",
  },
});

export const inputContainerVariants = cva(
  "hover:!sf:ring-0 sf:focus-within:!ring-0 sf:flex sf:items-center sf:gap-2 sf:transition-colors",
  {
    variants: {
      variant: {
        flat: "!sf:shadow-none sf:border-0 sf:bg-pyro-bg-tertiary",
        bordered: "!sf:bg-pyro-bg-primary sf:border-2",
        underlined:
          "!sf:bg-transparent sf:border-0 sf:border-input sf:border-b-2 sf:shadow-none",
        faded: "sf:border-2 sf:border-input/25 sf:bg-muted",
      },
      color: inputContainerColorStyles,
      size: sizeStyles,
      radius: radiusStyles,
      fullWidth: {
        true: "sf:w-full sf:justify-center",
        false: "",
      },
      animated: animatedStyles,
    },
    defaultVariants: {
      variant: "bordered",
      color: "default",
      size: "md",
      radius: "md",
      fullWidth: false,
      animated: false,
    },
  },
);

// Define label positions: top, left, right, bottom
export const labelPositionStyles = {
  top: "sf:flex-col sf:items-start",
  left: "sf:flex-row-reverse sf:items-center",
  right: "sf:flex-row sf:items-center",
  bottom: "sf:flex-col-reverse sf:items-start",
};

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size" | "color">,
    VariantProps<typeof inputContainerVariants> {
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isError?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  hint?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  inputSize?: number;
  label?: string | React.ReactNode;
  labelPlacement?: keyof typeof labelPositionStyles; // top, left, right, bottom
  fullWidth?: boolean;
}

export function Input({
  className,
  inputSize,
  size,
  radius,
  animated,
  variant,
  fullWidth = true,
  label,
  labelPlacement = "top", // Default label position is "top"
  type = "text",
  isDisabled,
  isRequired,
  isError,
  errorMessage,
  hint,
  isInvalid,
  startContent,
  endContent,
  color,
  onChange, // Destructure onChange from props
  ...props
}: InputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      if (type === "number") {
        const numericValue =
          event.target.value === "" ? null : parseFloat(event.target.value);
        // Create a synthetic event or pass the value directly depending on what the original onChange expects.
        // For simplicity, we'll modify the event object.
        // Note: Modifying event objects directly is generally not recommended.
        // A more robust solution might involve creating a new event or calling onChange with just the value.
        Object.defineProperty(event.target, "value", {
          writable: true,
          value: numericValue,
        });
        onChange(event);
      } else {
        onChange(event);
      }
    }
  };

  return (
    <div
      className={cn(
        "sf:space-y-1",
        labelPositionStyles[labelPlacement],
        labelPlacement === "left" || labelPlacement === "right"
          ? "sf:flex sf:items-center sf:gap-4"
          : "sf:flex sf:flex-col",
      )}
    >
      {label && (
        <Label
          htmlFor={props.id}
          // isDisabled={isDisabled}
          // isRequired={isRequired}
          className={cn(
            "sf:font-medium sf:text-pyro-text-primary sf:text-sm sf:leading-tight",
            labelPlacement === "top" || labelPlacement === "bottom"
              ? "sf:mb-2"
              : "sf:mr-2",
          )}
        >
          {label}
        </Label>
      )}
      <div
        className={cn(
          inputContainerVariants({
            variant,
            size,
            radius: variant === "underlined" ? "none" : radius,
            animated,
            fullWidth,
            color,
          }),
          (isError || isInvalid) && "sf:border-destructive",
          className,
        )}
      >
        {startContent && (
          <div className="sf:flex sf:items-center">{startContent}</div>
        )}
        <input
          type={type}
          data-slot="input"
          {...props}
          onChange={handleChange} // Use the new handleChange
          className={cn(
            inputVariants({
              size,
              animated,
              fullWidth,
              color,
            }),
            isError && "sf:border-destructive",
            className,
          )}
          size={inputSize}
          disabled={isDisabled || props.disabled}
          required={isRequired || props.required}
          readOnly={props.isReadOnly}
        />
        {endContent && (
          <div className="sf:flex sf:items-center">{endContent}</div>
        )}
      </div>
      {errorMessage ? (
        <p className="sf:px-1 sf:text-destructive sf:text-xs">{errorMessage}</p>
      ) : hint ? (
        <div className="sf:px-1 sf:text-muted-foreground sf:text-xs">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
