import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "sf:bg-popover sf:text-popover-foreground data-[state=open]:sf:animate-in data-[state=closed]:sf:animate-out data-[state=closed]:sf:fade-out-0 data-[state=open]:sf:fade-in-0 data-[state=closed]:sf:zoom-out-95 data-[state=open]:sf:zoom-in-95 data-[side=bottom]:sf:slide-in-from-top-2 data-[side=left]:sf:slide-in-from-right-2 data-[side=right]:sf:slide-in-from-left-2 data-[side=top]:sf:slide-in-from-bottom-2 sf:z-50 sf:w-72 sf:origin-(--radix-popover-content-transform-origin) sf:rounded-md sf:border sf:p-4 sf:shadow-md sf:outline-hidden",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
