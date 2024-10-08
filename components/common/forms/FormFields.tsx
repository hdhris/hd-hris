'use client';
import React, {FC, ReactNode} from "react";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {ControllerRenderProps, FieldValues, useFormContext} from "react-hook-form";
import InputStyle, {DateStyle} from "@/lib/custom/styles/InputStyle";
import {SelectionProp} from "./types/SelectionProp";
import {Input, InputProps, TextAreaProps} from "@nextui-org/input";
import {Select, SelectItem} from "@nextui-org/select";
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
    Switch,
    SwitchProps,
    Textarea,
    TimeInput,
    TimeInputProps,
} from "@nextui-org/react";
import {Case, Default, Switch as SwitchCase} from "@/components/common/Switch";
import {parseAbsoluteToLocal} from "@internationalized/date";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {Radio} from "@nextui-org/radio";
import {Key} from "@react-types/shared";
import {Granularity} from "@react-types/datepicker";

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
    "auto-complete"?: Omit<AutocompleteProps, "label">;
    checkbox?: CheckboxProps;
    "group-checkbox"?: Omit<CheckboxGroupProps, "label"> & {
        defaultValue?: string[]; // defaultValue is now part of the custom options
        options?: GroupInputOptions[]; // options is also part of the custom options
    };
    "date-input"?: Omit<DateInputProps, "label">,
    "date-picker"?: Omit<DatePickerProps, "label">
    "date-range-picker"?: Omit<DateRangePickerProps, "label">
    "radio-group"?: RadioGroupProps & {
        defaultValue?: string[]; // defaultValue is now part of the custom options
        options?: GroupInputOptions[]; // options is also part of the custom options
    };
    select?: Omit<SelectProps, "label">,
    "switch": SwitchProps,
    "time-input": Omit<TimeInputProps, "label">
    "text-area": Omit<TextAreaProps, "label">
}

// Define InputVariant, dynamically applying input-specific options or generic string-based props
// Define InputVariant, dynamically applying input-specific options or generic string-based props
type InputVariant = {
    [key in InputType]: key extends keyof InputOptions ? InputOptions[key] : { [key in InputType]: string | any };
};


// FormInputProps with dynamic variant property
export interface FormInputProps {
    placeholder?: string;
    name: string;
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
}

interface FormsControlProps {
    items: FormInputProps[];
    size?: InputProps['size'];
}

interface FormInputOptions {
    item: FormInputProps,
    control: any,
    size: InputProps['size']
}


const RenderFormItem: FC<FormInputOptions> = ({item, control, size}) => {
    // const [dateInput, setDateInput] = useState<DateValue | null>(parseAbsoluteToLocal("2021-04-07T18:45:22Z"))
    // const [datePickerInput, setDatePickerInput] = useState<DateValue | null>(null)
    // const [timeInput, setTimeInput] = useState<TimeInputValue | null>(null)
    //
    // const [dateRangePickerInput, setDateRangePickerInput] = React.useState<RangeValue<DateValue> | null>(null);


    return (<FormField
        control={control}
        name={item.name}
        render={({field}) => {
            return (<FormItem>
                {item.label && item.type !== "checkbox" && item.type !== "group-checkbox" && item.type !== "radio-group" && item.type !== "switch" && (
                    <FormLabel htmlFor={item.name} className={item.inputClassName}>
                        {item.label}
                    </FormLabel>)}
                {item.isRequired && <span className="ml-2 inline-flex text-destructive text-medium"> *</span>}
                <FormControl className="space-y-2">
                    {item.Component ? (item.Component(field)) : (<SwitchCase expression={item.type}>
                        <Case of="auto-complete">
                            <Autocomplete
                                {...(item.config as AutocompleteProps)}
                                id={item.name}
                                aria-label={item.name}
                                disabled={item.inputDisabled}
                                autoFocus={item.isFocus}
                                {...field}
                                variant="bordered"
                                radius="sm"
                                selectedKey={field.value ? String(field.value) : null}
                                onSelectionChange={(value) => {
                                    field.onChange(value)
                                }}
                            >
                                {(item.config as any)?.options?.map((option: GroupInputOptions) => (
                                    <AutocompleteItem key={option.value}
                                                      {...((item.config as any)?.autocompleteItem as Omit<AutocompleteItemProps, "key">)}
                                    >
                                        {option.label}
                                    </AutocompleteItem>))}
                            </Autocomplete>
                        </Case>
                        <Case of="checkbox">
                            <Checkbox
                                {...(item.config as CheckboxProps)}
                                id={item.name}
                                aria-label={item.name}
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
                                id={item.name}
                                aria-label={item.name}
                                disabled={item.inputDisabled}
                                autoFocus={item.isFocus}
                                isSelected={field.value}
                                {...field}
                            >
                                {(item.config as any)?.options?.map((option: GroupInputOptions) => (
                                    <Checkbox key={option.value} value={option.value}
                                              {...((item.config as any)?.checkboxes as CheckboxProps)}
                                    >
                                        {option.label}
                                    </Checkbox>))}
                            </CheckboxGroup>
                        </Case>
                        <Case of="date-input">
                            <DateInput
                                variant="bordered"
                                radius="sm"
                                classNames={DateStyle}
                                {...field}
                                {...(item.config as DateInputProps)}
                                id={item.name}
                                value={field.value && dayjs(field.value).isValid() ? parseAbsoluteToLocal(dayjs(field.value).toISOString()) : null}
                                granularity={(item.config as any)?.granularity as Granularity || "day"}
                                aria-label={item.name}
                                isDisabled={item.inputDisabled}
                                autoFocus={item.isFocus}
                                onChange={(value) => {
                                    if (value) {

                                        field.onChange(value.toString())
                                    }
                                }}
                            />

                        </Case>
                        <Case of="date-picker">
                            <DatePicker
                                variant="bordered"
                                radius="sm"
                                classNames={DateStyle}
                                {...field}
                                {...(item.config as DatePickerProps)}
                                value={field.value && dayjs(field.value).isValid() ? parseAbsoluteToLocal(dayjs(field.value).toISOString()) : null}
                                id={item.name}
                                granularity={(item.config as any)?.granularity as Granularity || "day"}
                                aria-label={item.name}
                                isDisabled={item.inputDisabled}
                                autoFocus={item.isFocus}
                                onChange={(value) => {
                                    if (value) {

                                        field.onChange(value.toString());
                                    }
                                }}
                            />
                        </Case>
                        <Case of="date-range-picker">
                            <DateRangePicker
                                id={item.name}
                                aria-label={item.name}
                                isDisabled={item.inputDisabled}
                                autoFocus={item.isFocus}
                                variant="bordered"
                                radius="sm"
                                value={field.value?.start && field.value?.end && dayjs(field.value?.start).isValid() && dayjs(field.value?.end).isValid() ? {
                                    start: parseAbsoluteToLocal(dayjs(field.value?.start).toISOString()),
                                    end: parseAbsoluteToLocal(dayjs(field.value?.end).toISOString()),
                                } : null}
                                granularity={(item.config as any)?.granularity as Granularity || "day"}
                                isRequired
                                onChange={(value) => {
                                    field.onChange({
                                        start: value?.start.toString(), end: value?.end.toString(),
                                    })
                                }}
                            />

                        </Case>
                        <Case of="radio-group">
                            <RadioGroup
                                label={item.label}
                                id={item.name}
                                aria-label={item.name}
                                disabled={item.inputDisabled}
                                autoFocus={item.isFocus}
                                {...field}
                                {...(item.config as RadioGroupProps)}
                            >
                                {/*<Radio value="buenos-aires">Buenos Aires</Radio>*/}
                                {(item.config as any)?.options?.map((option: GroupInputOptions) => (
                                    <Radio key={option.value} value={option.value}
                                           {...((item.config as any)?.radios as Omit<RadioProps, "value">)}
                                    >
                                        {option.label}
                                    </Radio>))}
                            </RadioGroup>
                        </Case>
                        <Case of="select">
                            <Select
                                id={item.name}
                                aria-label={item.name}
                                disabled={item.inputDisabled}
                                autoFocus={item.isFocus}
                                color="primary"
                                variant="bordered"
                                radius="sm"
                                selectedKeys={new Set<Key>([field.value as Key]) || "all"} // Cast field.value to Key
                                {...field}
                                {...(item.config as Omit<SelectProps, "label">)}

                            >
                                {/*<Radio value="buenos-aires">Buenos Aires</Radio>*/}
                                {(item.config as any)?.options?.map((option: GroupInputOptions) => (
                                    <SelectItem key={option.value}
                                                {...((item.config as any)?.selected as SelectedItems)}
                                    >
                                        {option.label}
                                    </SelectItem>))}
                            </Select>
                        </Case>
                        <Case of="switch">
                            <Switch
                                {...(item.config as SwitchProps)}
                                id={item.name}
                                aria-label={item.name}
                                disabled={item.inputDisabled}
                                autoFocus={item.isFocus}
                                size={size}
                                {...field}
                                isSelected={field.value}
                            >
                                {item.label}
                            </Switch>
                        </Case>
                        <Case of="time-input">
                            <TimeInput
                                value={field.value && dayjs(field.value).isValid() ? parseAbsoluteToLocal(dayjs(field.value).toISOString()) : null}
                                granularity={(item.config as any)?.granularity as 'hour' | 'minute' | 'second' || "hour"}
                                id={item.name}
                                aria-label={item.name}
                                isDisabled={item.inputDisabled}
                                autoFocus={item.isFocus}
                                variant="bordered"
                                radius="sm"
                                {...(item.config as TimeInputProps)}
                                onChange={(value) => {
                                    field.onChange(value.toString());
                                }}
                            />
                        </Case>
                        <Case of="text-area">
                            <Textarea
                                id={item.name}
                                aria-label={item.name}
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
                                id={item.name}
                                aria-label={item.name}
                                disabled={item.inputDisabled}
                                autoFocus={item.isFocus}
                                type={String(item.type)}
                                variant="bordered"
                                color="success"
                                radius="sm"
                                placeholder={item.placeholder}
                                size={size}
                                {...field}
                                classNames={InputStyle}
                                endContent={item.endContent}
                                startContent={item.startContent}
                            />
                        </Default>
                    </SwitchCase>)}
                </FormControl>
                <FormMessage/>
                {item.description && <FormDescription>{item.description}</FormDescription>}
            </FormItem>)
        }}
    />);
};

export const Selection = ({
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
                          }: SelectionProp & FormInputProps & Omit<SelectProps, "children">) => {
    const {control} = useFormContext();

    return (<FormField
        control={control}
        name={name!}
        render={({field}) => (<FormItem>
            {label && (<FormLabel htmlFor={name}>
                {label}
                {isRequired && <span className="text-destructive text-medium"> *</span>}
            </FormLabel>)}
            <FormControl>
                <Select
                    id={name}
                    aria-label="Selection"
                    color="primary"
                    variant="bordered"
                    selectedKeys={selectedKeys ? selectedKeys : (field.value ? [String(field.value)] : [])}
                    disabledKeys={disableKeys}
                    onOpenChange={onOpenChange}
                    onChange={(e) => {
                        field.onChange(e); // Update react-hook-form's state
                        if (onChange) {
                            onChange(e); // Custom onChange handler
                        }
                    }}
                    classNames={{
                        trigger: "rounded", popoverContent: "rounded",
                    }}
                    radius="sm"
                    placeholder={placeholder}
                    {...rest}
                >
                    {items.map((item) => {
                        if (typeof item === "object") {
                            return (<SelectItem key={String(item.key)} value={String(item.key)}>
                                {item.label}
                            </SelectItem>);
                        }
                        return (<SelectItem key={item.toLowerCase()} value={item.toLowerCase()}>
                            {item}
                        </SelectItem>);
                    })}
                </Select>
            </FormControl>
            <FormMessage/>
            {description && <FormDescription>{description}</FormDescription>}
        </FormItem>)}
    />);
};

export default function FormFields({items, size}: FormsControlProps) {
    const {control} = useFormContext();
    // RenderFormItem(item, control, index, size))}
    return <>{items.map((item, index) => <RenderFormItem key={index} item={item} control={control} size={size}/>)}</>;
}
