"use client";
import React, { FC, ReactNode } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ControllerRenderProps, FieldValues, useFormContext } from "react-hook-form";
import InputStyle, { DateStyle } from "@/lib/custom/styles/InputStyle";
import { SelectionProp } from "./types/SelectionProp";
import { InputProps, TextAreaProps } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/react";
import {
    Autocomplete,
    AutocompleteItem,
    AutocompleteItemProps,
    AutocompleteProps,
    Checkbox,
    CheckboxGroup,
    CheckboxGroupProps,
    CheckboxProps,
    DateInput,
    DateInputProps,
    DatePicker,
    DatePickerProps,
    DateRangePicker,
    DateRangePickerProps,
    RadioGroup,
    RadioGroupProps,
    RadioProps,
    SelectedItems,
    SelectProps,
    SwitchProps,
    Textarea,
    TimeInput,
    TimeInputProps,
    cn,
} from "@nextui-org/react";
import { Case, Default, Switch as SwitchCase } from "@/components/common/Switch";
import { getLocalTimeZone, parseAbsolute } from "@internationalized/date";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Radio } from "@nextui-org/radio";
import { Key } from "@react-types/shared";
import { Granularity } from "@react-types/datepicker";
import { Input } from "@/components/ui/input";
import FormSwitch from "@/components/ui/FormSwitch";
import dayjs from "dayjs";
import { toGMT8 } from "@/lib/utils/toGMT8";

// Load plugins
dayjs.extend(utc);
dayjs.extend(timezone);

type InputType =
    | "auto-complete"
    | "button"
    | "checkbox"
    | "group-checkbox"
    | "date-input"
    | "date-picker"
    | "date-range-picker"
    | "radio-group"
    | "select"
    | "switch"
    | "time-input"
    | "text-area"
    | "color"
    | "date"
    | "datetime-local"
    | "email"
    | "file"
    | "hidden"
    | "image"
    | "month"
    | "number"
    | "password"
    | "range"
    | "reset"
    | "search"
    | "submit"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week";

// Define the type for the options in the group-checkbox
export interface GroupInputOptions {
    value: string;
    label: string;
}

// Input options for specific input types
interface InputOptions {
    "auto-complete"?: Omit<AutocompleteProps, "children">;
    checkbox?: CheckboxProps;
    "group-checkbox"?: Omit<CheckboxGroupProps, "label"> & {
        defaultValue?: string[]; // defaultValue is now part of the custom options
        options?: GroupInputOptions[]; // options is also part of the custom options
    };
    "date-input"?: Omit<DateInputProps, "label">;
    "date-picker"?: Omit<DatePickerProps, "label">;
    "date-range-picker"?: Omit<DateRangePickerProps, "label">;
    "radio-group"?: RadioGroupProps & {
        defaultValue?: string[]; // defaultValue is now part of the custom options
        options?: GroupInputOptions[]; // options is also part of the custom options
    };
    select?: Omit<SelectProps, "label">;
    switch: SwitchProps;
    "time-input": Omit<TimeInputProps, "label">;
    "text-area": Omit<TextAreaProps, "label">;
}

// Define InputVariant, dynamically applying input-specific options or generic string-based props
type InputVariant = {
    [key in InputType]: key extends keyof InputOptions ? InputOptions[key] : { [key in InputType]: string | any };
};

// FormInputProps with dynamic variant property
export interface FormInputProps<T = any> {
    placeholder?: string;
    name: keyof T; // Use the generic type T for the name prop
    label?: ReactNode;
    isFocus?: boolean;
    type?: InputType;
    inputDisabled?: boolean;
    inputClassName?: string;
    isRequired?: boolean;
    description?: string;
    Component?: (field: ControllerRenderProps<FieldValues, string>) => React.ReactElement;
    endContent?: React.ReactNode;
    startContent?: React.ReactNode;
    config?: InputVariant[InputType]; // Ensure config can handle CheckboxGroupProps
    isVisible?: boolean | (() => boolean); // Option to hide the field
}

interface FormsControlProps<T> {
    items: FormInputProps<T>[];
    size?: InputProps["size"];
}

interface FormInputOptions<T> {
    item: FormInputProps<T>;
    control: any;
    size: InputProps["size"];
}

const RenderFormItem = <T,>({ item, control, size }: FormInputOptions<T>) => {
    // Determine if the field is visible
    const isVisible = typeof item.isVisible === "function" ? item.isVisible() : item.isVisible !== false;
    const timezone = getLocalTimeZone(); //"UTC";
    if (!isVisible) return null; // If the field is not visible, return null
    return (
        <FormField
            control={control}
            name={item.name as string}
            render={({ field }) => {
                return (
                    <FormItem className="w-full">
                        {item.label &&
                            item.type !== "checkbox" &&
                            item.type !== "group-checkbox" &&
                            item.type !== "switch" && (
                                <FormLabel
                                    htmlFor={item.name as string}
                                    className={cn(item.inputClassName, item.inputDisabled ? "text-default-400/75" : "")}
                                >
                                    {item.label}
                                </FormLabel>
                            )}
                        {item.isRequired && <span className="ml-2 inline text-destructive text-medium"> *</span>}
                        <FormControl className="space-y-2 w-full">
                            {item.Component ? (
                                item.Component(field)
                            ) : (
                                <SwitchCase expression={item.type}>
                                    <Case of="auto-complete">
                                        <Autocomplete
                                            isVirtualized
                                            disableSelectorIconRotation
                                            placeholder={item.placeholder}
                                            {...(item.config as AutocompleteProps)}
                                            id={item.name as string}
                                            aria-label={item.name as string}
                                            disabled={item.inputDisabled}
                                            defaultItems={(item.config as any)?.options ?? undefined}
                                            autoFocus={item.isFocus}
                                            size={size}
                                            variant="bordered"
                                            radius="sm"
                                            selectedKey={field.value ? String(field.value) : null}
                                            onSelectionChange={(e) => {
                                                field.onChange(e);
                                            }}
                                            {...field}
                                        >
                                            {(item.config as any)?.options?.map((option: GroupInputOptions) => {
                                                return (
                                                    <AutocompleteItem
                                                        textValue={option.label}
                                                        key={option.value}
                                                        {...((item.config as any)?.autocompleteItem as Omit<
                                                            AutocompleteItemProps,
                                                            "key"
                                                        >)}
                                                    >
                                                        <p>{option.label}</p>
                                                    </AutocompleteItem>
                                                );
                                            })}
                                        </Autocomplete>
                                    </Case>
                                    <Case of="checkbox">
                                        <Checkbox
                                            {...(item.config as CheckboxProps)}
                                            id={item.name as string}
                                            aria-label={item.name as string}
                                            disabled={item.inputDisabled}
                                            autoFocus={item.isFocus}
                                            size={size}
                                            isSelected={field.value}
                                            {...field}
                                        >
                                            {item.label}
                                        </Checkbox>
                                    </Case>
                                    <Case of="group-checkbox">
                                        <CheckboxGroup
                                            {...(item.config as CheckboxGroupProps)}
                                            label={item.label}
                                            id={item.name as string}
                                            size={size}
                                            aria-label={item.name as string}
                                            disabled={item.inputDisabled}
                                            autoFocus={item.isFocus}
                                            {...field}
                                        >
                                            {(item.config as any)?.options?.map((option: GroupInputOptions) => (
                                                <Checkbox
                                                    key={option.value}
                                                    value={option.value}
                                                    {...((item.config as any)?.checkboxes as CheckboxProps)}
                                                >
                                                    {option.label}
                                                </Checkbox>
                                            ))}
                                        </CheckboxGroup>
                                    </Case>
                                    <Case of="date-input">
                                        <DateInput
                                            variant="bordered"
                                            radius="sm"
                                            classNames={DateStyle}
                                            {...field}
                                            id={item.name as string}
                                            size={size}
                                            granularity={((item.config as any)?.granularity as Granularity) || "day"}
                                            aria-label={item.name as string}
                                            isDisabled={item.inputDisabled}
                                            autoFocus={item.isFocus}
                                            value={
                                                field.value
                                                    ? typeof field.value === "string" || field.value instanceof Date
                                                        ? parseAbsolute(toGMT8(field.value).toISOString(), timezone)
                                                        : field.value
                                                    : parseAbsolute(new Date().toISOString(), timezone)
                                            }
                                            onChange={(value) => {
                                                if (!field.onChange) return;
                                                if (typeof field.value === "string") {
                                                    field.onChange(value?.toDate(timezone).toISOString());
                                                } else if (field.value instanceof Date) {
                                                    field.onChange(value?.toDate(timezone));
                                                } else {
                                                    field.onChange(value);
                                                }
                                            }}
                                            // value={field.value && toGMT8(field.value).isValid() ? parseAbsolute(toGMT8(field.value).toISOString(), timezone) : null}
                                            // onChange={(value) => value && field.onChange(toGMT8(value.toDate(timezone)).toISOString())}
                                            {...(item.config as DateInputProps)}
                                        />
                                    </Case>
                                    <Case of="date-picker">
                                        <DatePicker
                                            variant="bordered"
                                            radius="sm"
                                            {...field}
                                            id={item.name as string}
                                            granularity={((item.config as any)?.granularity as Granularity) || "day"}
                                            aria-label={item.name as string}
                                            isDisabled={item.inputDisabled}
                                            autoFocus={item.isFocus}
                                            className={cn("w-full", (item.config as any)?.className)}
                                            value={
                                                field.value
                                                    ? typeof field.value === "string" || field.value instanceof Date
                                                        ? parseAbsolute(toGMT8(field.value).toISOString(), timezone)
                                                        : field.value
                                                    : parseAbsolute(new Date().toISOString(), timezone)
                                            }
                                            onChange={(value) => {
                                                if (!field.onChange) return;
                                                if (typeof field.value === "string") {
                                                    field.onChange(value?.toDate(timezone).toISOString());
                                                } else if (field.value instanceof Date) {
                                                    field.onChange(value?.toDate(timezone));
                                                } else {
                                                    field.onChange(value);
                                                }
                                            }}
                                            // value={field.value && toGMT8(field.value).isValid() ? parseAbsolute(toGMT8(field.value).toISOString(), timezone) : null}
                                            // onChange={(value) => value && field.onChange(toGMT8(value?.toDate(timezone)).toISOString())}
                                            {...(item.config as DatePickerProps)}
                                        />
                                    </Case>
                                    <Case of="date-range-picker">
                                        <DateRangePicker
                                            id={item.name as string}
                                            aria-label={item.name as string}
                                            isDisabled={item.inputDisabled}
                                            autoFocus={item.isFocus}
                                            variant="bordered"
                                            radius="sm"
                                            size={size}
                                            granularity={((item.config as any)?.granularity as Granularity) || "day"}
                                            isRequired
                                            hideTimeZone={(item.config as any)?.hideTimeZone as boolean}
                                            value={
                                                field.value?.start &&
                                                field.value?.end &&
                                                toGMT8(field.value?.start).isValid() &&
                                                toGMT8(field.value?.end).isValid()
                                                    ? {
                                                          start: parseAbsolute(
                                                              toGMT8(field.value?.start).toISOString(),
                                                              timezone
                                                          ),
                                                          end: parseAbsolute(
                                                              toGMT8(field.value?.end).toISOString(),
                                                              timezone
                                                          ),
                                                      }
                                                    : {
                                                          start: parseAbsolute(new Date().toISOString(), timezone),
                                                          end: parseAbsolute(new Date().toISOString(), timezone),
                                                      }
                                            }
                                            onChange={(value) =>
                                                value &&
                                                field.onChange({
                                                    start: value?.start.toString(),
                                                    end: value?.end.toString(),
                                                })
                                            }
                                            {...(item.config as DateRangePickerProps)}
                                        />
                                    </Case>
                                    <Case of="radio-group">
                                        <RadioGroup
                                            id={item.name as string}
                                            aria-label={item.name as string}
                                            isDisabled={item.inputDisabled}
                                            autoFocus={item.isFocus}
                                            {...field}
                                            size={size}
                                            {...(item.config as RadioGroupProps)}
                                        >
                                            {(item.config as any)?.options?.map((option: GroupInputOptions) => (
                                                <Radio
                                                    key={option.value}
                                                    value={option.value}
                                                    {...((item.config as any)?.radios as Omit<RadioProps, "value">)}
                                                >
                                                    {option.label}
                                                </Radio>
                                            ))}
                                        </RadioGroup>
                                    </Case>
                                    <Case of="select">
                                        <Select
                                            placeholder={item.placeholder}
                                            id={item.name as string}
                                            aria-label={item.name as string}
                                            disabled={item.inputDisabled}
                                            autoFocus={item.isFocus}
                                            color="primary"
                                            variant="bordered"
                                            radius="sm"
                                            size={size}
                                            selectedKeys={new Set<Key>([field.value as Key]) || "all"} // Cast field.value to Key
                                            {...field}
                                            {...(item.config as Omit<SelectProps, "label">)}
                                        >
                                            {(item.config as any)?.options?.map((option: GroupInputOptions) => (
                                                <SelectItem
                                                    key={option.value}
                                                    {...((item.config as any)?.selected as SelectedItems)}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </Case>
                                    <Case of="switch">
                                        <FormSwitch
                                            id={item.name as string}
                                            aria-label={item.name as string}
                                            disabled={item.inputDisabled}
                                            autoFocus={item.isFocus}
                                            size={size}
                                            {...field}
                                            isSelected={field.value}
                                            onValueChange={field.onChange}
                                            {...(item.config as SwitchProps)}
                                        >
                                            {item.label}
                                        </FormSwitch>
                                    </Case>
                                    <Case of="time-input">
                                        <TimeInput
                                            value={
                                                field.value && toGMT8(field.value).isValid()
                                                    ? parseAbsolute(toGMT8(field.value).toISOString(), timezone)
                                                    : null
                                            }
                                            granularity={
                                                ((item.config as any)?.granularity as "hour" | "minute" | "second") ||
                                                "hour"
                                            }
                                            id={item.name as string}
                                            aria-label={item.name as string}
                                            isDisabled={item.inputDisabled}
                                            autoFocus={item.isFocus}
                                            variant="bordered"
                                            radius="sm"
                                            size={size}
                                            {...(item.config as TimeInputProps)}
                                            onChange={(value) =>
                                                field.onChange(toGMT8(value?.toString().split("[")[0]).toISOString())
                                            }
                                        />
                                    </Case>
                                    <Case of="text-area">
                                        <Textarea
                                            placeholder={item.placeholder}
                                            id={item.name as string}
                                            aria-label={item.name as string}
                                            isDisabled={item.inputDisabled}
                                            autoFocus={item.isFocus}
                                            radius="sm"
                                            variant="bordered"
                                            {...field}
                                            {...(item.config as TextAreaProps)}
                                        />
                                    </Case>
                                    <Default>
                                        <Input
                                            id={item.name as string}
                                            aria-label={item.name as string}
                                            disabled={item.inputDisabled}
                                            autoFocus={item.isFocus}
                                            type={item.type || "text"}
                                            variant="bordered"
                                            color="success"
                                            radius="sm"
                                            placeholder={item.placeholder}
                                            size={size}
                                            value={item.type === "number" ? Number(field.value) : field.value}
                                            classNames={InputStyle}
                                            endContent={item.endContent}
                                            startContent={item.startContent}
                                            onFocus={(e) =>
                                                e.target.addEventListener(
                                                    "wheel",
                                                    function (e) {
                                                        e.preventDefault();
                                                    },
                                                    { passive: false }
                                                )
                                            }
                                            onValueChange={(value) => {
                                                if (item.type === "number") {
                                                    const numericValue = Number(value);
                                                    if (!isNaN(numericValue) || value === "") {
                                                        field.onChange(value === "" ? null : numericValue);
                                                    }
                                                } else {
                                                    field.onChange(value);
                                                }
                                            }}
                                            {...(item.config as InputProps)}
                                        />
                                    </Default>
                                </SwitchCase>
                            )}
                        </FormControl>
                        {item.description && <FormDescription>{item.description}</FormDescription>}
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
};

export const Selection = <T,>({
    placeholder,
    items,
    name,
    label,
    isRequired,
    description,
    onChange,
    disableKeys,
    onOpenChange,
    selectedKeys,
    ...rest
}: SelectionProp & FormInputProps<T> & Omit<SelectProps, "children">) => {
    const { control } = useFormContext();

    return (
        <FormField
            control={control}
            name={name as string}
            render={({ field }) => (
                <FormItem>
                    {label && (
                        <FormLabel htmlFor={name as string}>
                            {label}
                            {isRequired && <span className="text-destructive text-medium"> *</span>}
                        </FormLabel>
                    )}
                    <FormControl>
                        <Select
                            id={name as string}
                            aria-label="Selection"
                            color="primary"
                            variant="bordered"
                            selectedKeys={selectedKeys ? selectedKeys : field.value ? [String(field.value)] : []}
                            disabledKeys={disableKeys}
                            onOpenChange={onOpenChange}
                            onChange={(e) => {
                                field.onChange(e);
                                if (onChange) {
                                    onChange(e);
                                }
                            }}
                            classNames={{
                                trigger: "rounded",
                                popoverContent: "rounded",
                            }}
                            radius="sm"
                            placeholder={placeholder}
                            {...rest}
                        >
                            {items.map((item) => {
                                if (typeof item === "object") {
                                    return (
                                        <SelectItem key={String(item.key)} value={String(item.key)}>
                                            {item.label}
                                        </SelectItem>
                                    );
                                }
                                return (
                                    <SelectItem key={item.toLowerCase()} value={item.toLowerCase()}>
                                        {item}
                                    </SelectItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                    <FormMessage />
                    {description && <FormDescription>{description}</FormDescription>}
                </FormItem>
            )}
        />
    );
};

export default function FormFields<T>({ items, size }: FormsControlProps<T>) {
    const { control } = useFormContext();
    return (
        <>
            {items.map((item, index) => (
                <RenderFormItem key={index} item={item} control={control} size={size} />
            ))}
        </>
    );
}
