"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:sf:animate-in data-[state=closed]:sf:animate-out data-[state=closed]:sf:fade-out-0 data-[state=open]:sf:fade-in-0 sf:fixed sf:inset-0 sf:z-50 sf:bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "sf:bg-background data-[state=open]:sf:animate-in data-[state=closed]:sf:animate-out data-[state=closed]:sf:fade-out-0 data-[state=open]:sf:fade-in-0 data-[state=closed]:sf:zoom-out-95 data-[state=open]:sf:zoom-in-95 sf:fixed sf:top-[50%] sf:left-[50%] sf:z-50 sf:grid sf:w-full sf:max-w-[calc(100%-2rem)] sf:translate-x-[-50%] sf:translate-y-[-50%] sf:gap-4 sf:rounded-lg sf:border sf:p-6 sf:shadow-lg sf:duration-200 sm:sf:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="sf:ring-offset-background sf:focus:ring-ring data-[state=open]:sf:bg-accent data-[state=open]:sf:text-muted-foreground sf:absolute sf:top-4 sf:right-4 sf:rounded-xs sf:opacity-70 sf:transition-opacity hover:sf:opacity-100 sf:focus:ring-2 sf:focus:ring-offset-2 sf:focus:outline-hidden sf:disabled:pointer-events-none [&_svg]:sf:pointer-events-none [&_svg]:sf:shrink-0 [&_svg:not([class*='size-'])]:sf:size-4">
          <XIcon />
          <span className="sf:sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "sf:flex sf:flex-col sf:gap-2 sf:text-center sm:sf:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "sf:flex sf:flex-col-reverse sf:gap-2 sm:sf:flex-row sm:sf:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("sf:text-lg sf:leading-none sf:font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("sf:text-muted-foreground sf:text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
