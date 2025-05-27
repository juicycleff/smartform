"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { radiusStyles, sizeStyles } from "../../lib/styles";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Label } from "./label";
import { inputContainerColorStyles } from "./input";

const selectVariants = cva("sf:w-full sf:justify-between", {
  variants: {
    variant: {
      default: "sf:border sf:shadow-sm",
      flat: "sf:shadow-none sf:border-0 sf:bg-muted",
      bordered: "sf:bg-background sf:border-2",
      underlined:
        "sf:bg-transparent sf:border-0 sf:border-input sf:border-b-2 sf:shadow-none sf:rounded-none",
      faded: "sf:border-2 sf:border-input/25 sf:bg-muted",
    },
    color: inputContainerColorStyles,
    // size: {
    //   xs: "h-6 text-xs",
    //   sm: "h-8 text-sm",
    //   default: "h-9 text-sm",
    //   md: "h-9 text-sm",
    //   lg: "h-10 text-base",
    //   xl: "h-11 text-lg",
    // },
    size: sizeStyles,
    radius: radiusStyles,
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    radius: "md",
    color: "default",
  },
  compoundVariants: [
    {
      variant: "underlined",
      className: "sf:rounded-none",
    },
  ],
});

const contentVariants = cva("sf:p-0", {
  variants: {
    variant: {
      default: "sf:bg-popover sf:border sf:shadow-md",
      flat: "sf:shadow-none sf:border-0 sf:bg-muted",
      bordered: "sf:bg-background sf:border-2",
      underlined: "sf:bg-background sf:border sf:shadow-md",
      faded: "sf:border-2 sf:border-input/25 sf:bg-muted",
    },
    radius: radiusStyles,
  },
  defaultVariants: {
    variant: "default",
    radius: "md",
  },
});

const commandInputVariants = cva("", {
  variants: {
    size: sizeStyles,
    variant: {
      default: "sf:bg-transparent",
      flat: "sf:bg-transparent",
      bordered: "sf:bg-transparent",
      underlined: "sf:bg-transparent sf:border-b",
      faded: "sf:bg-transparent",
    },
    radius: {
      none: "sf:rounded-none",
      xs: "sf:rounded-xs",
      sm: "sf:rounded-sm",
      md: "sf:rounded-md",
      lg: "sf:rounded-lg",
      xl: "sf:rounded-xl",
      full: "sf:rounded-full",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
    radius: "md",
  },
});

// Define a generic type for options
export type SelectOption<T> = {
  [key: string]: any;
  disabled?: boolean;
} & T;

// Update the EnhancedSelectProps interface to include the label
interface EnhancedSelectProps<T extends string = string>
  extends Omit<
      React.ComponentPropsWithoutRef<typeof Button>,
      "color" | "variant" | "onChange" | "size"
    >,
    VariantProps<typeof selectVariants> {
  options: SelectOption<T>[];
  optionValue?: keyof SelectOption<T>;
  optionLabel?: keyof SelectOption<T>;
  optionIcon?: keyof SelectOption<T>;
  optionDescription?: keyof SelectOption<T>;
  placeholder?: string;
  value?: T | T[];
  onChange?: (value: T | T[]) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  position?: "popper" | "item-aligned";
  maxHeight?: number;
  maxSelected?: number;
  renderOption?: (option: SelectOption<T>) => React.ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  name?: string;
  hint?: string;
  id?: string;
  startContent?: React.ReactNode;
  renderValue?: (value: T | T[], options: SelectOption<T>[]) => React.ReactNode;
  label?: string;
  labelClassName?: string;
}

export const EnhancedSelect = React.forwardRef<
  HTMLButtonElement,
  EnhancedSelectProps
>(
  (
    {
      options,
      optionValue = "value",
      optionLabel = "label",
      optionIcon = "icon",
      optionDescription = "description",
      placeholder = "Select an option",
      value,
      onChange,
      disabled = false,
      // loading = false,
      error,
      hint,
      multiple = false,
      searchable = false,
      clearable = false,
      className,
      triggerClassName,
      contentClassName,
      itemClassName,
      size = "default",
      // position = "item-aligned",
      variant = "default",
      radius = "md",
      maxHeight = 300,
      maxSelected,
      renderOption,
      onBlur,
      onFocus,
      name,
      id,
      startContent,
      renderValue,
      label,
      labelClassName,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      value ? (Array.isArray(value) ? value : [value]) : [],
    );

    React.useEffect(() => {
      if (multiple) {
        setSelectedValues(Array.isArray(value) ? value : value ? [value] : []);
      } else {
        setSelectedValues(value ? [value as string] : []);
      }
    }, [value, multiple]);

    const handleSelect = React.useCallback(
      (optionValue: string) => {
        let newValues: string[];

        if (multiple) {
          if (selectedValues.includes(optionValue)) {
            newValues = selectedValues.filter((v) => v !== optionValue);
          } else {
            if (maxSelected && selectedValues.length >= maxSelected) {
              return;
            }
            newValues = [...selectedValues, optionValue];
          }
        } else {
          newValues = [optionValue];
          setOpen(false);
        }

        setSelectedValues(newValues);

        if (onChange) {
          onChange(multiple ? newValues : newValues[0] || "");
        }
      },
      [multiple, onChange, selectedValues, maxSelected],
    );

    const handleClear = React.useCallback(
      (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedValues([]);
        if (onChange) {
          onChange(multiple ? [] : "");
        }
      },
      [multiple, onChange],
    );

    const filteredOptions = React.useMemo(() => {
      if (!searchable || !search) return options;

      return options.filter(
        (option) =>
          String(option[optionLabel])
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          String(option[optionValue])
            .toLowerCase()
            .includes(search.toLowerCase()),
      );
    }, [options, search, searchable, optionLabel, optionValue]);

    const selectedLabels = React.useMemo(() => {
      return selectedValues
        .map(
          (v) =>
            options.find((option) => option[optionValue] === v)?.[optionLabel],
        )
        .filter(Boolean) as string[];
    }, [selectedValues, options, optionValue, optionLabel]);

    const singleSelect = (
      <Select
        value={selectedValues[0]}
        onValueChange={(value) => {
          if (onChange) onChange(value);
        }}
        disabled={disabled}
        name={name}
      >
        <SelectTrigger
          id={id}
          className={cn(
            selectVariants({ radius }),
            error && "sf:border-destructive",
            triggerClassName,
          )}
        >
          <SelectValue
            placeholder={
              <span className="placeholder:sf:text-left placeholder:sf:truncate placeholder:sf:text-ellipsis">
                placeholder
              </span>
            }
          />
        </SelectTrigger>
        <SelectContent
          className={cn(contentVariants({ radius }), contentClassName)}
          style={{
            width: "var(--radix-select-trigger-width)",
            maxHeight: "var(--radix-select-content-available-height)",
          }}
        >
          {options.map((option) => (
            <SelectItem
              key={option[optionValue]}
              value={option[optionValue]}
              disabled={option.disabled}
              className={itemClassName}
            >
              {renderOption ? (
                renderOption(option)
              ) : (
                <div className="sf:flex sf:flex-col">
                  <div className="sf:flex sf:items-center sf:gap-2">
                    {option[optionIcon]}
                    <span>{option[optionLabel]}</span>
                  </div>
                  {option[optionDescription] && (
                    <span className="sf:text-xs sf:text-muted-foreground">
                      {option[optionDescription]}
                    </span>
                  )}
                </div>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );

    // If using standard select for non-searchable, non-multiple select
    if (!searchable && !multiple) {
      if (label) {
        return (
          <div className="sf:space-y-2">
            <Label
              htmlFor={id}
              className={cn("sf:text-pyro-text-primary", labelClassName)}
            >
              {label}
            </Label>
            {singleSelect}
          </div>
        );
      }

      return singleSelect;
    }

    // Wrap the select component with a label if provided

    const selectComponent = (
      <div className={cn("sf:relative", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div
              className={cn(
                "sf:flex sf:flex-1 sf:items-center sf:overflow-hidden",
                selectVariants({ variant, size, radius }),
                error && "sf:border-destructive",
                triggerClassName,
              )}
            >
              {startContent}
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-expect-error */}
              <Button
                ref={ref}
                {...props}
                id={id}
                variant={"light"}
                size={size}
                disabled={disabled}
                role="combobox"
                fullWidth
                aria-expanded={open}
                aria-haspopup="listbox"
                className={cn({
                  "!sf:rounded-l-none sf:pl-1": !!startContent,
                })}
                onClick={() => {
                  onFocus?.();
                  setOpen(!open);
                }}
                onBlur={onBlur}
                onFocus={onFocus}
              >
                <div className="sf:flex sf:flex-1 sf:items-center sf:gap-1 sf:overflow-hidden">
                  {renderValue ? (
                    renderValue(selectedValues, options)
                  ) : multiple ? (
                    selectedValues.length > 0 ? (
                      <div className="sf:flex sf:flex-wrap sf:gap-1">
                        {selectedValues.length <= 2 ? (
                          selectedLabels.map((label, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className={cn(
                                "sf:max-w-[150px] sf:truncate",
                                radius === "full" && "sf:rounded-full",
                                radius === "xl" && "sf:rounded-xl",
                                radius === "lg" && "sf:rounded-lg",
                                radius === "md" && "sf:rounded-md",
                                radius === "sm" && "sf:rounded-sm",
                                radius === "xs" && "sf:rounded-xs",
                                radius === "none" && "sf:rounded-none",
                              )}
                            >
                              {label}
                              {clearable && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="sf:ml-1 sf:h-4 sf:w-4 sf:p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(selectedValues[i]);
                                  }}
                                >
                                  <X className="sf:h-3 sf:w-3" />
                                  <span className="sf:sr-only">Remove</span>
                                </Button>
                              )}
                            </Badge>
                          ))
                        ) : (
                          <Badge
                            variant="secondary"
                            className={cn(
                              radius === "full" && "sf:rounded-full",
                              radius === "xl" && "sf:rounded-xl",
                              radius === "lg" && "sf:rounded-lg",
                              radius === "md" && "sf:rounded-md",
                              radius === "sm" && "sf:rounded-sm",
                              radius === "xs" && "sf:rounded-xs",
                              radius === "none" && "sf:rounded-none",
                            )}
                          >
                            {selectedValues.length} selected
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="sf:text-muted-foreground">
                        {placeholder}
                      </span>
                    )
                  ) : selectedValues.length > 0 ? (
                    <span className="sf:truncate">
                      {
                        options.find(
                          (option) => option[optionValue] === selectedValues[0],
                        )?.[optionLabel]
                      }
                    </span>
                  ) : (
                    <span className="sf:text-muted-foreground">
                      {placeholder}
                    </span>
                  )}
                </div>
                <div className="sf:flex sf:items-center sf:gap-1">
                  {clearable && selectedValues.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "sf:h-4 sf:w-4 sf:p-0",
                        radius === "full" && "sf:rounded-full",
                        radius === "xl" && "sf:rounded-xl",
                        radius === "lg" && "sf:rounded-lg",
                        radius === "md" && "sf:rounded-md",
                        radius === "sm" && "sf:rounded-sm",
                        radius === "xs" && "sf:rounded-xs",
                        radius === "none" && "sf:rounded-none",
                      )}
                      onClick={handleClear}
                    >
                      <X className="sf:h-3 sf:w-3" />
                      <span className="sf:sr-only">Clear</span>
                    </Button>
                  )}
                  <ChevronsUpDown className="sf:h-4 sf:w-4 sf:opacity-50" />
                </div>
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className={cn(
              contentVariants({ variant, radius }),
              contentClassName,
            )}
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            <Command shouldFilter={false}>
              {searchable && (
                <CommandInput
                  placeholder="Search..."
                  value={search}
                  onValueChange={setSearch}
                  className={cn(
                    commandInputVariants({ size, variant, radius }),
                  )}
                />
              )}
              <CommandList
                className={cn("sf:max-h-[300px]")}
                style={{
                  maxHeight: maxHeight ? `${maxHeight}px` : "300px",
                }}
              >
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {filteredOptions.map((option) => {
                    const isSelected = selectedValues.includes(
                      option[optionValue],
                    );
                    return (
                      <CommandItem
                        key={option[optionValue]}
                        value={option[optionValue]}
                        disabled={option.disabled}
                        onSelect={() => handleSelect(option[optionValue])}
                        className={cn(
                          "sf:flex sf:items-center sf:gap-2",
                          isSelected && "sf:bg-accent",
                          option.disabled &&
                            "sf:opacity-50 sf:cursor-not-allowed",
                          itemClassName,
                        )}
                      >
                        {multiple && (
                          <div
                            className={cn(
                              "sf:flex sf:h-4 sf:w-4 sf:items-center sf:justify-center sf:border sf:border-primary",
                              radius === "full" && "sf:rounded-full",
                              radius === "xl" && "sf:rounded-xl",
                              radius === "lg" && "sf:rounded-lg",
                              radius === "md" && "sf:rounded-md",
                              radius === "sm" && "sf:rounded-sm",
                              radius === "xs" && "sf:rounded-xs",
                              radius === "none" && "sf:rounded-none",
                              isSelected
                                ? "sf:bg-primary sf:text-primary-foreground"
                                : "sf:opacity-50",
                            )}
                          >
                            {isSelected && <Check className="sf:h-3 sf:w-3" />}
                          </div>
                        )}
                        {renderOption ? (
                          renderOption(option)
                        ) : (
                          <div className="sf:flex sf:flex-col">
                            <div className="sf:flex sf:items-center sf:gap-2">
                              {option[optionIcon]}
                              <span>{option[optionLabel]}</span>
                            </div>
                            {option[optionDescription] && (
                              <span className="sf:text-xs sf:text-muted-foreground">
                                {option[optionDescription]}
                              </span>
                            )}
                          </div>
                        )}
                        {!multiple && isSelected && (
                          <Check className="sf:ml-auto sf:h-4 sf:w-4" />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {error && (
          <p className="sf:p-1 sf:text-sm sf:text-destructive">{error}</p>
        )}
        {hint && !error && <p className="sf:p-1 sf:text-xs">{hint}</p>}
        {name && (
          <input
            type="hidden"
            name={name}
            value={
              multiple ? selectedValues.join(",") : selectedValues[0] || ""
            }
          />
        )}
      </div>
    );

    // If a label is provided, wrap the select component with a label
    if (label) {
      return (
        <div className="sf:space-y-2">
          <Label
            htmlFor={id}
            className={cn("sf:text-pyro-text-primary", labelClassName)}
          >
            {label}
          </Label>
          {selectComponent}
        </div>
      );
    }

    return selectComponent;
  },
);

EnhancedSelect.displayName = "EnhancedSelect";
