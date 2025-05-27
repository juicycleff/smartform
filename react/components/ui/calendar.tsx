import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("sf:p-3", className)}
      classNames={{
        months: "sf:flex sf:flex-col sm:sf:flex-row sf:gap-2",
        month: "sf:flex sf:flex-col sf:gap-4",
        caption:
          "sf:flex sf:justify-center sf:pt-1 sf:relative sf:items-center sf:w-full",
        caption_label: "sf:text-sm sf:font-medium",
        nav: "sf:flex sf:items-center sf:gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "sf:size-7 sf:bg-transparent sf:p-0 sf:opacity-50 hover:sf:opacity-100",
        ),
        nav_button_previous: "sf:absolute sf:left-1",
        nav_button_next: "sf:absolute sf:right-1",
        table: "sf:w-full sf:border-collapse sf:space-x-1",
        head_row: "sf:flex",
        head_cell:
          "sf:text-muted-foreground sf:rounded-md sf:w-8 sf:font-normal sf:text-[0.8rem]",
        row: "sf:flex sf:w-full sf:mt-2",
        cell: cn(
          "sf:relative sf:p-0 sf:text-center sf:text-sm sf:focus-within:relative sf:focus-within:z-20 [&:has([aria-selected])]:sf:bg-accent [&:has([aria-selected].day-range-end)]:sf:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:sf:rounded-r-md [&:has(>.day-range-start)]:sf:rounded-l-md first:[&:has([aria-selected])]:sf:rounded-l-md last:[&:has([aria-selected])]:sf:rounded-r-md"
            : "[&:has([aria-selected])]:sf:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "sf:size-8 sf:p-0 sf:font-normal sf:aria-selected:opacity-100",
        ),
        day_range_start:
          "day-range-start sf:aria-selected:bg-primary sf:aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end sf:aria-selected:bg-primary sf:aria-selected:text-primary-foreground",
        day_selected:
          "sf:bg-primary sf:text-primary-foreground hover:sf:bg-primary hover:sf:text-primary-foreground focus:sf:bg-primary focus:sf:text-primary-foreground",
        day_today: "sf:bg-accent sf:text-accent-foreground",
        day_outside:
          "day-outside sf:text-muted-foreground sf:aria-selected:text-muted-foreground",
        day_disabled: "sf:text-muted-foreground sf:opacity-50",
        day_range_middle:
          "sf:aria-selected:bg-accent sf:aria-selected:text-accent-foreground",
        day_hidden: "sf:invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("sf:size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("sf:size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
