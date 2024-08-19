import {ChipProps} from "@nextui-org/react";
import React from "react";
import {Chip} from "@nextui-org/chip";

interface StatusProps {
    text?: React.ReactNode
    color: ChipProps['color']
}
export const Status = ({text, color}:StatusProps) => {
    return (
        <Chip
            className="capitalize border-none gap-1 text-default-600"
            color={color}
            size="sm"
            variant="dot"
        >
            {text && text}
        </Chip>
    );
}