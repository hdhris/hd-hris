'use client'
import React from "react";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {ControllerRenderProps, FieldValues, useFormContext} from "react-hook-form";
import InputStyle from "@/lib/custom/styles/InputStyle";
import {SelectionProp} from "./types/SelectionProp";
import {Input, InputProps} from "@nextui-org/input";
import {Select, SelectItem} from "@nextui-org/select";

export interface FormInputProps {
    placeholder?: string;
    name: string;
    label?: string;
    isFocus?: boolean;
    type?: string;
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
                {item.label && (<FormLabel htmlFor={item.name}>
                        {item.label}
                        {item.isRequired && <span className="text-destructive text-medium"> *</span>}
                    </FormLabel>)}
                <FormControl>
                    {item.Component ? (item.Component(field)) : (<Input
                            id={item.name}
                            aria-label={item.name}
                            disabled={item.inputDisabled}
                            autoFocus={item.isFocus}
                            type={item.type || "text"}
                            variant="bordered"
                            color="success"
                            placeholder={item.placeholder}
                            size={size}
                            className={item.inputClassName}
                            {...field}
                            classNames={InputStyle}
                            endContent={item.endContent}
                            startContent={item.startContent}
                        />)}
                </FormControl>
                <FormMessage/>
                {item.description && <FormDescription>{item.description}</FormDescription>}
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
                              value
                          }: SelectionProp & FormInputProps) => {
    const { control } = useFormContext();


    return (
        <FormField
            control={control}
            name={name!}
            render={({ field }) => {

                return (
                    <FormItem>
                        {label && (
                            <FormLabel htmlFor={name}>
                                {label}
                                {isRequired && <span className="text-destructive text-medium"> *</span>}
                            </FormLabel>
                        )}
                        <FormControl>
                            <Select
                                id={name}
                                aria-label="Selection"
                                color="primary"
                                variant="bordered"
                                selectedKeys={(field.value ? [String(field.value)] : [])}
                                disabledKeys={disableKeys}
                                onOpenChange={onOpenChange}
                                onChange={(e) => {
                                    field.onChange(e); // Update react-hook-form's state
                                    if (onChange) {
                                        onChange(e); // Custom onChange handler
                                    }
                                }}
                                classNames={{
                                    trigger: "rounded",
                                    popoverContent: "rounded",
                                }}
                                radius="sm"
                                placeholder={placeholder}
                            >
                                {items.map((item) => {
                                    if (typeof item === "object") {
                                        return (
                                            <SelectItem key={String(item.key)} value={String(item.key)}>
                                                {item.label}
                                            </SelectItem>
                                        );
                                    }
                                    console.log(item)
                                    return (
                                        <SelectItem key={item.toLowerCase()} value={item.toLowerCase()}>
                                            {item}
                                        </SelectItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <FormMessage/>
                        {description && <FormDescription>{description}</FormDescription>}
                    </FormItem>
                )
            }}
        />
    );
};



export default function FormFields({items, size}: FormsControlProps) {
    const {control} = useFormContext();
    return <>{items.map((item, index) => renderFormItem(item, control, index, size))}</>;
}