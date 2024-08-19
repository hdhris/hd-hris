import {Tooltip} from "@nextui-org/tooltip";
import {Button} from "@nextui-org/button";
import React from "react";
import {Pencil, Trash2} from "lucide-react";
import {ButtonProps, TooltipProps} from "@nextui-org/react";

interface ActionProps {
    name: string
    onDelete?: () => void; // for delete
    onEdit?: () => void; // for edit
}
export const ActionButton = ({onDelete, onEdit, name}: ActionProps) => {
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
        {onEdit && actionBTN({children:  <Pencil className='text-default-400'/>, tooltipColor: "default", tooltipName: "Edit", variant: "light", onAction: onEdit})}
        {onDelete && actionBTN({children: <Trash2 className='text-danger'/>, tooltipColor: "danger", tooltipName: "Delete", variant: "light", onAction: onDelete})}
    </>);
};