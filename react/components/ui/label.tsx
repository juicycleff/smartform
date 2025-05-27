import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "sf:flex sf:items-center sf:gap-2 sf:text-sm sf:leading-none sf:font-medium sf:select-none group-data-[disabled=true]:sf:pointer-events-none group-data-[disabled=true]:sf:opacity-50 sf:peer-disabled:cursor-not-allowed sf:peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
