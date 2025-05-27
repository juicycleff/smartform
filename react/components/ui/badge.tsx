import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "sf:inline-flex sf:items-center sf:justify-center sf:rounded-md sf:border sf:px-2 sf:py-0.5 sf:text-xs sf:font-medium sf:w-fit sf:whitespace-nowrap sf:shrink-0 [&>svg]:sf:size-3 sf:gap-1 [&>svg]:sf:pointer-events-none sf:focus-visible:border-ring sf:focus-visible:ring-ring/50 sf:focus-visible:ring-[3px] sf:aria-invalid:ring-destructive/20 dark:sf:aria-invalid:ring-destructive/40 sf:aria-invalid:border-destructive sf:transition-[color,box-shadow] sf:overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "sf:border-transparent sf:bg-primary sf:text-primary-foreground [a&]:sf:hover:bg-primary/90",
        secondary:
          "sf:border-transparent sf:bg-secondary sf:text-secondary-foreground [a&]:sf:hover:bg-secondary/90",
        destructive:
          "sf:border-transparent sf:bg-destructive sf:text-white [a&]:sf:hover:bg-destructive/90 sf:focus-visible:ring-destructive/20 dark:sf:focus-visible:ring-destructive/40 dark:sf:bg-destructive/60",
        outline:
          "sf:text-foreground [a&]:sf:hover:bg-accent [a&]:sf:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
