'use client'
import React, {HTMLInputTypeAttribute, Ref} from "react";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {ControllerRenderProps, FieldValues, useFormContext} from "react-hook-form";
import InputStyle from "@/lib/custom/styles/InputStyle";
import {SelectionProp} from "./types/SelectionProp";
import {Input, InputProps} from "@nextui-org/input";
import {Select, SelectItem} from "@nextui-org/select";
import {SelectProps} from "@nextui-org/react";
import BorderedSwitch from "../BorderedSwitch";

type InputType =
    "button"
    | "checkbox"
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
    | "radio"
    | "range"
    | "reset"
    | "search"
    | "submit"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week"

// Usage example

export interface FormInputProps {
    placeholder?: string;
    name: string;
    label?: string;
    isFocus?: boolean;
    type?:  InputType;
    inputDisabled?: boolean;
    inputClassName?: string;
    isRequired?: boolean;
    description?: string;
    Component?: (field: ControllerRenderProps<FieldValues, string>) => React.ReactElement;
    endContent?: React.ReactNode;
    startContent?: React.ReactNode;
}

interface FormsControlProps {
    items: FormInputProps[];
    size?: InputProps['size']
}

const renderFormItem = (item: FormInputProps, control: any, index: number, size: InputProps['size']) => (<FormField
    key={index}
    control={control}
    name={item.name}
    render={({field}) => (<FormItem>
        {item.label &&!(item.type?.toString()==="checkbox") && (<FormLabel htmlFor={item.name}  className={item.inputClassName}>
            {item.label}
            {item.isRequired && <span className="text-destructive text-medium"> *</span>}
        </FormLabel>)}
        <FormControl>
            {item.Component ? (item.Component(field)) 
            : item.type && item.type==="checkbox" ? (
                <BorderedSwitch
                    className="my-2"
                    label={item.label || item.name}
                    description={item.description || undefined}
                    isSelected={field.value}
                    onValueChange={field.onChange}
                />
            ): (
                <Input
                id={item.name}
                aria-label={item.name}
                disabled={item.inputDisabled}
                autoFocus={item.isFocus}
                type={String(item.type)}
                variant="bordered"
                color="success"
                placeholder={item.placeholder}
                size={size}
                {...field}
                classNames={InputStyle}
                endContent={item.endContent}
                startContent={item.startContent}
            />)}
        </FormControl>
        <FormMessage/>
        {item.description &&!(item.type?.toString()==="checkbox") && <FormDescription>{item.description}</FormDescription>}
    </FormItem>)}
/>);

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
            render={({field}) => {

                // console.log("Keys based on selectedKeys: ", selectedKeys)
                // console.log("Keys based on fields: ", field.value)
                // console.log("Keys: ", selectedKeys ? selectedKeys : (field.value ? [String(field.value)] : []))
                return (<FormItem>
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
                                    console.log(item)
                                    return (<SelectItem key={item.toLowerCase()} value={item.toLowerCase()}>
                                            {item}
                                        </SelectItem>);
                                })}
                            </Select>
                        </FormControl>
                        <FormMessage/>
                        {description && <FormDescription>{description}</FormDescription>}
                    </FormItem>)
            }}
        />);
};


export default function FormFields({items, size}: FormsControlProps) {
    const {control} = useFormContext();
    return <>{items.map((item, index) => renderFormItem(item, control, index, size))}</>;
}