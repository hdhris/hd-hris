// import {InputSlots, SelectSlots, SlotsToClasses} from "@nextui-org/react";

import {InputSlots, SlotsToClasses} from "@nextui-org/theme";

const InputStyle:SlotsToClasses<InputSlots> = {
    innerWrapper: "bg-transparent",
    inputWrapper: [
        "h-10",
        'rounded',
        "group-data-[focus=true]:border-primary"
        // 'group-data-[focus=true]:border-amber-500'
        // "group-data-[focus=true]:border-blue-700",
        // "dark:group-data-[focused=true]:bg-default/60",
    ],
}

//
export default InputStyle