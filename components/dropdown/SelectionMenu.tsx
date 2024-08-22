'use client'
import React from 'react';
import {Select, SelectItem, SelectProps} from "@nextui-org/react";
import {capitalize} from "@nextui-org/shared-utils";

type Options = {
    uid: string; name: string;
};

interface SelectionMenuProps extends Omit<SelectProps, 'children'> {
    label: string;
    options: Options[];
}

function SelectionMenu({label, options, ...props}: SelectionMenuProps) {
    return (<Select {...props} size='sm' classNames={{
        base: 'min-w-[130px]',
    }} aria-label="Selection" color="primary" variant="bordered" radius="sm"
                    placeholder={label}>
        {options.map((opt) => (<SelectItem key={opt.uid} value={opt.uid}>
            {capitalize(opt.name)}
        </SelectItem>))}
    </Select>);
}

export default SelectionMenu;
