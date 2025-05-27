import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("sf:grid sf:gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "sf:border-input sf:text-primary sf:focus-visible:border-ring sf:focus-visible:ring-ring/50 sf:aria-invalid:ring-destructive/20 dark:sf:aria-invalid:ring-destructive/40 sf:aria-invalid:border-destructive dark:sf:bg-input/30 sf:aspect-square sf:size-4 sf:shrink-0 sf:rounded-full sf:border sf:shadow-xs sf:transition-[color,box-shadow] sf:outline-none sf:focus-visible:ring-[3px] sf:disabled:cursor-not-allowed sf:disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="sf:relative sf:flex sf:items-center sf:justify-center"
      >
        <CircleIcon className="sf:fill-primary sf:absolute sf:top-1/2 sf:left-1/2 sf:size-2 sf:-translate-x-1/2 sf:-translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
