import {ChipProps, cn} from "@nextui-org/react";
import React from "react";
import {Chip} from "@nextui-org/chip";

interface StatusProps {
    children?: React.ReactNode
    isCapitalize?: boolean
    color?: ChipProps['color']
}
export const Status = ({children, color, isCapitalize}:StatusProps) => {
    return (
        <Chip
            className={cn("border-none gap-1 text-default-600", isCapitalize && 'capitalize')}
            color={color || 'default'}
            size="sm"
            variant="dot"
        >
            {children}
        </Chip>
    );
}