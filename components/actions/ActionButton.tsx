
import {Tooltip} from "@nextui-org/tooltip";
import {Button} from "@nextui-org/button";
import React from "react";
import {ButtonProps, cn, TooltipProps} from "@nextui-org/react";
import {LuPencil, LuTrash2} from "react-icons/lu";

interface ActionProps {
    name: string
    onDelete?: () => void; // for delete
    onEdit?: () => void; // for edit
}
export const TableActionButton = ({onDelete, onEdit, name}: ActionProps) => {
    interface ActionBTNProps {
        children: React.ReactNode
        tooltipColor?: TooltipProps["color"]
        variant?: ButtonProps["variant"]
        onAction: () => void
        tooltipName: string
    }

    const actionBTN = ({children, tooltipColor, variant, onAction, tooltipName}: ActionBTNProps) => (
        <Tooltip content={`${tooltipName} ${name}`} color={tooltipColor || "default"}>
            <Button isIconOnly variant={variant || "light"} onClick={onAction}>
                {children}
            </Button>
        </Tooltip>)
    return (<>
        {onEdit && actionBTN({children:  <LuPencil size={18} className='text-default-400'/>, tooltipColor: "default", tooltipName: "Edit", variant: "light", onAction: onEdit})}
        {onDelete && actionBTN({children: <LuTrash2 size={18} className='text-danger'/>, tooltipColor: "danger", tooltipName: "Delete", variant: "light", onAction: onDelete})}
    </>);
};


interface ActionButton {
    className?: string
    onCancel?: () => void
    onSave?: () => void
    label?: string
    isLoading?: boolean
}
export const ActionButtons: React.FC<ActionButton> = ({onCancel, onSave, className, label, isLoading}) => (
    <div className={cn('flex justify-end space-x-3 mt-auto', className)}>
        <Button size='sm' variant='light' onClick={onCancel}>Cancel</Button>
        <Button size='sm' variant='solid' color='primary' onClick={onSave} isLoading={isLoading}>{label}</Button>
    </div>
);