import { Ripple, useRipple } from "@heroui/ripple";
import { Slot, Slottable } from "@radix-ui/react-slot";
import {
  animatedStyles,
  isIconOnlyStyles,
  radiusStyles,
  rippleStyles,
  sizeWithPaddingStyles,
  variantStyles,
} from "../../lib/styles";
import { cn } from "../../lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type * as React from "react";

const baseStyles =
  "sf:inline-flex sf:items-center sf:justify-center sf:gap-2 sf:whitespace-nowrap sf:text-sm sf:font-medium sf:transition-[color,box-shadow] sf:disabled:pointer-events-none [&_svg]:sf:pointer-events-none [&_svg:not([class*='size-'])]:sf:size-4 [&_svg]:sf:shrink-0 sf:ring-ring/10 dark:sf:ring-ring/20 dark:sf:outline-ring/40 sf:outline-ring/50 sf:focus-visible:ring-4 sf:focus-visible:outline-1 sf:aria-invalid:focus-visible:ring-0";

const buttonVariants = cva(baseStyles, {
  variants: {
    variant: variantStyles,
    size: sizeWithPaddingStyles,
    radius: radiusStyles,
    fullWidth: {
      true: "sf:w-full sf:justify-center",
      false: "",
    },
    ripple: rippleStyles,
    isIconOnly: isIconOnlyStyles,
    animated: animatedStyles,
    isLoading: {
      true: "sf:cursor-wait", // styles for loading state, can add spinner here
      false: "sf:cursor-pointer",
    },
  },
  defaultVariants: {
    variant: "secondary",
    size: "sm",
    radius: "md",
    fullWidth: false,
    ripple: true,
    animated: false,
    isIconOnly: false,
    isLoading: false,
  },
});

type OnPress = (ev: React.MouseEvent<HTMLButtonElement>) => void;

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  onPress?: OnPress;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

function Button({
  className,
  variant,
  size,
  radius,
  fullWidth,
  isIconOnly,
  asChild = false,
  type = "button", // Default type to "button"
  ariaLabel,
  isLoading,
  isDisabled = false,
  animated = false,
  ripple = true,
  disabled,
  children,
  startContent,
  endContent,
  onClick,
  onPress,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const {
    onPress: onRipplePressHandler,
    onClear: onClearRipple,
    ripples,
  } = useRipple({
    disabled: isDisabled || disabled || isLoading, // Disable ripple if button is disabled or loading
  });

  const onPressHandler = (ev: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || isLoading) {
      return;
    }
    if (ripple) {
      onRipplePressHandler(ev as any);
    }

    onClick?.(ev);
    onPress?.(ev);
  };

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          radius,
          fullWidth,
          ripple,
          isIconOnly,
          isLoading,
          className,
          animated,
        }),
      )}
      disabled={isDisabled || isLoading}
      type={type}
      aria-label={ariaLabel}
      onClick={onPressHandler}
      {...props}
    >
      {isLoading && (
        <Loader2 className="sf:mr-2 sf:h-5 sf:w-5 sf:animate-spin" />
      )}
      {!isLoading && startContent && (
        <span className="start-content">{startContent}</span>
      )}
      {isLoading && isIconOnly ? null : <Slottable>{children}</Slottable>}
      {!isLoading && endContent && (
        <span className="end-content">{endContent}</span>
      )}

      {ripple && <Ripple ripples={ripples} onClear={onClearRipple} />}
    </Comp>
  );
}

export { Button, buttonVariants };
