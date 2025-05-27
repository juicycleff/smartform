import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "sf:bg-popover sf:text-popover-foreground sf:flex sf:h-full sf:w-full sf:flex-col sf:overflow-hidden sf:rounded-md",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sf:sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="sf:overflow-hidden sf:p-0">
        <Command className="[&_[cmdk-group-heading]]:sf:text-muted-foreground **:data-[slot=command-input-wrapper]:sf:h-12 [&_[cmdk-group-heading]]:sf:px-2 [&_[cmdk-group-heading]]:sf:font-medium [&_[cmdk-group]]:sf:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:sf:pt-0 [&_[cmdk-input-wrapper]_svg]:sf:h-5 [&_[cmdk-input-wrapper]_svg]:sf:w-5 [&_[cmdk-input]]:sf:h-12 [&_[cmdk-item]]:sf:px-2 [&_[cmdk-item]]:sf:py-3 [&_[cmdk-item]_svg]:sf:h-5 [&_[cmdk-item]_svg]:sf:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="sf:flex sf:h-9 sf:items-center sf:gap-2 sf:border-b sf:px-3"
    >
      <SearchIcon className="sf:size-4 sf:shrink-0 sf:opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:sf:text-muted-foreground sf:flex sf:h-10 sf:w-full sf:rounded-md sf:bg-transparent sf:py-3 sf:text-sm sf:outline-hidden sf:disabled:cursor-not-allowed sf:disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "sf:max-h-[300px] sf:scroll-py-1 sf:overflow-x-hidden sf:overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="sf:py-6 sf:text-center sf:text-sm"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "sf:text-foreground [&_[cmdk-group-heading]]:sf:text-muted-foreground sf:overflow-hidden sf:p-1 [&_[cmdk-group-heading]]:sf:px-2 [&_[cmdk-group-heading]]:sf:py-1.5 [&_[cmdk-group-heading]]:sf:text-xs [&_[cmdk-group-heading]]:sf:font-medium",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("sf:bg-border sf:-mx-1 sf:h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:sf:bg-accent data-[selected=true]:sf:text-accent-foreground [&_svg:not([class*='text-'])]:sf:text-muted-foreground sf:relative sf:flex sf:cursor-default sf:items-center sf:gap-2 sf:rounded-sm sf:px-2 sf:py-1.5 sf:text-sm sf:outline-hidden sf:select-none data-[disabled=true]:sf:pointer-events-none data-[disabled=true]:sf:opacity-50 [&_svg]:sf:pointer-events-none [&_svg]:sf:shrink-0 [&_svg:not([class*='size-'])]:sf:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "sf:text-muted-foreground sf:ml-auto sf:text-xs sf:tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
