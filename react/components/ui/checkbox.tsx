import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "sf:peer sf:border-input dark:sf:bg-input/30 data-[state=checked]:sf:bg-primary data-[state=checked]:sf:text-primary-foreground dark:data-[state=checked]:sf:bg-primary data-[state=checked]:sf:border-primary sf:focus-visible:border-ring sf:focus-visible:ring-ring/50 sf:aria-invalid:ring-destructive/20 dark:sf:aria-invalid:ring-destructive/40 sf:aria-invalid:border-destructive sf:size-4 sf:shrink-0 sf:rounded-[4px] sf:border sf:shadow-xs sf:transition-shadow sf:outline-none sf:focus-visible:ring-[3px] sf:disabled:cursor-not-allowed sf:disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="sf:flex sf:items-center sf:justify-center sf:text-current sf:transition-none"
      >
        <CheckIcon className="sf:size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
