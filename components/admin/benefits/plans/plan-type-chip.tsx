import React from 'react';
import {bgColor} from "@/helper/background-color-generator/generator";
import {Chip} from "@nextui-org/chip";

function PlanTypeChip({type}: {type: string}) {
    return (
        <Chip classNames={{
            content: "font-medium"
        }} className="mb-2" {...bgColor(type, 0.5)}>{type}</Chip>
    );
}

export default PlanTypeChip;