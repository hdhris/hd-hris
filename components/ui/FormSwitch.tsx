import React, { forwardRef } from 'react';
import { cn, Switch as SwitchNextUI, SwitchProps } from "@nextui-org/react";

interface SwitchProp extends SwitchProps {}

const FormSwitch = forwardRef<HTMLInputElement, SwitchProp>(({ ...rest }, ref) => {
    return (
        <SwitchNextUI
            {...rest}
            ref={ref}
            classNames={{
                base: cn(
                    "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                    "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                    "data-[selected=true]:border-primary"
                ),
                wrapper: "p-0 h-4 overflow-visible",
                thumb: cn(
                    "w-6 h-6 border-2 shadow-lg",
                    "group-data-[hover=true]:border-primary", // selected
                    "group-data-[selected=true]:ml-6", // pressed
                    "group-data-[pressed=true]:w-7",
                    "group-data-[selected]:group-data-[pressed]:ml-4"
                ),
            }}
        />
    );
});

FormSwitch.displayName = "FormSwitch";
export default FormSwitch;
