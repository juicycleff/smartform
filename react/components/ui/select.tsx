import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "sf:border-input data-[placeholder]:sf:text-muted-foreground [&_svg:not([class*='text-'])]:sf:text-muted-foreground sf:focus-visible:border-ring sf:focus-visible:ring-ring/50 sf:aria-invalid:ring-destructive/20 dark:sf:aria-invalid:ring-destructive/40 sf:aria-invalid:border-destructive dark:sf:bg-input/30 dark:hover:sf:bg-input/50 sf:flex sf:w-fit sf:items-center sf:justify-between sf:gap-2 sf:rounded-md sf:border sf:bg-transparent sf:px-3 sf:py-2 sf:text-sm sf:whitespace-nowrap sf:shadow-xs sf:transition-[color,box-shadow] sf:outline-none sf:focus-visible:ring-[3px] sf:disabled:cursor-not-allowed sf:disabled:opacity-50 data-[size=default]:sf:h-9 data-[size=sm]:sf:h-8 *:data-[slot=select-value]:sf:line-clamp-1 *:data-[slot=select-value]:sf:flex *:data-[slot=select-value]:sf:items-center *:data-[slot=select-value]:sf:gap-2 [&_svg]:sf:pointer-events-none [&_svg]:sf:shrink-0 [&_svg:not([class*='size-'])]:sf:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="sf:size-4 sf:opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "sf:bg-popover sf:text-popover-foreground data-[state=open]:sf:animate-in data-[state=closed]:sf:animate-out data-[state=closed]:sf:fade-out-0 data-[state=open]:sf:fade-in-0 data-[state=closed]:sf:zoom-out-95 data-[state=open]:sf:zoom-in-95 data-[side=bottom]:sf:slide-in-from-top-2 data-[side=left]:sf:slide-in-from-right-2 data-[side=right]:sf:slide-in-from-left-2 data-[side=top]:sf:slide-in-from-bottom-2 sf:relative sf:z-50 sf:max-h-(--radix-select-content-available-height) sf:min-w-[8rem] sf:origin-(--radix-select-content-transform-origin) sf:overflow-x-hidden sf:overflow-y-auto sf:rounded-md sf:border sf:shadow-md",
          position === "popper" &&
            "data-[side=bottom]:sf:translate-y-1 data-[side=left]:sf:-translate-x-1 data-[side=right]:sf:translate-x-1 data-[side=top]:sf:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "sf:p-1",
            position === "popper" &&
              "sf:h-[var(--radix-select-trigger-height)] sf:w-full sf:min-w-[var(--radix-select-trigger-width)] sf:scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "sf:text-muted-foreground sf:px-2 sf:py-1.5 sf:text-xs",
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "sf:focus:bg-accent sf:focus:text-accent-foreground [&_svg:not([class*='text-'])]:sf:text-muted-foreground sf:relative sf:flex sf:w-full sf:cursor-default sf:items-center sf:gap-2 sf:rounded-sm sf:py-1.5 sf:pr-8 sf:pl-2 sf:text-sm sf:outline-hidden sf:select-none data-[disabled]:sf:pointer-events-none data-[disabled]:sf:opacity-50 [&_svg]:sf:pointer-events-none [&_svg]:sf:shrink-0 [&_svg:not([class*='size-'])]:sf:size-4 *:[span]:last:sf:flex *:[span]:last:sf:items-center *:[span]:last:sf:gap-2",
        className,
      )}
      {...props}
    >
      <span className="sf:absolute sf:right-2 sf:flex sf:size-3.5 sf:items-center sf:justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="sf:size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "sf:bg-border sf:pointer-events-none sf:-mx-1 sf:my-1 sf:h-px",
        className,
      )}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "sf:flex sf:cursor-default sf:items-center sf:justify-center sf:py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="sf:size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "sf:flex sf:cursor-default sf:items-center sf:justify-center sf:py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="sf:size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
