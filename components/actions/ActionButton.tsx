'use client'
import React from "react";
import {Button} from "@nextui-org/button";
import {cn} from "@nextui-org/react";


interface ActionButton {
    className?: string
    onCancel?: () => void
    onSave?: () => void
    label?: string
}
export const ActionButtons: React.FC<ActionButton> = ({onCancel, onSave, className, label}) => (
    <div className={cn('flex justify-end space-x-3 mt-auto', className)}>
        <Button size='sm' variant='light' onClick={onCancel}>Cancel</Button>
        <Button size='sm' variant='solid' color='primary' onClick={onSave}>{label}</Button>
    </div>
);