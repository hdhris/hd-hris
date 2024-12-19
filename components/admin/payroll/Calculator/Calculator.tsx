"use client";
import { Button, Popover, PopoverContent, PopoverTrigger, Textarea } from "@nextui-org/react";
import React, { useCallback, useEffect, useMemo } from "react";
import { calcbuttons, isNumeric, isValidAdjacent, var_buttons } from "./buttons";
import { FaCalculator } from "react-icons/fa";
import { BaseValueProp, calculateAllPayheads } from "@/helper/payroll/calculations";
import { useQuery } from "@/services/queries";

function PayheadCalculator({
    id,
    payhead,
    input,
    setInput,
    setInvalid,
}: {
    payhead?: {
        id: number;
        system_only: boolean;
    };
    id?: string;
    input: string;
    setInput: (value: string) => void;
    setInvalid: (value: boolean) => void;
}) {
    const { data: payheadVariables, isLoading } = useQuery<string[]>(
        `/api/admin/utils/get-payhead-variables?id=${payhead?.id}`
    );

    // useEffect(() => {
    //     console.log(payheadVariables);
    // }, [payheadVariables]);

    // Ignore system variables that can update calculations
    // 1 : Basic Salary
    const isDisabled = useMemo(() => {
        if(payhead)
          return [1].includes(payhead.id)===false && payhead.system_only;

        return false;
        return payhead?.system_only;
    }, [payhead]);

    const isValidExpression = useMemo(() => {
        if (isDisabled) return true;
        if (String(input).trim() === "") return true;

        const baseVariables: BaseValueProp = {
            rate_p_hr: 1,
            total_shft_hr: 1,
            payroll_days: 1,
            basic_salary: 1,
            ...payheadVariables?.reduce((acc, variable) => {
                acc[variable] = 1;
                return acc;
            }, {} as Record<string, number>),
        };
        console.log(baseVariables);

        const vals = calculateAllPayheads(baseVariables, [{ payhead_id: -1, formula: input, variable: "x" }]);
        return vals.length > 0;
    }, [input, payheadVariables, isDisabled]);

    useEffect(() => {
        setInvalid(!isValidExpression);
    }, [isValidExpression, setInvalid]);

    const handleBackspace = useCallback(() => {
        let val = input;
        // const isLastCharNumber = (char: string) => /\d/.test(char);

        if (val.length > 0) {
            const lastChar = val[val.length - 1];
            if (isValidAdjacent(lastChar)) {
                val = val.slice(0, -1);
            } else {
                // If the last character is not a number, remove until a space is reached
                while (val.length > 0 && !(val[val.length - 1] === " ")) {
                    val = val.slice(0, -1);
                }

                // Remove the space after the loop if there is one
                if (val.length > 0 && val[val.length - 1] === " ") {
                    val = val.slice(0, -1);
                }
            }
        }
        setInput(val);
    },[input, setInput]);
    
    const handleButtonClick = useCallback(
        (value: string) => {
            if (value === "C") {
                setInput("");
            } else if (value === "←") {
                handleBackspace();
            } else {
                const newVal =
                    (isValidAdjacent(value) && isValidAdjacent(input.slice(-1))) || input === "" ? value : ` ${value}`;
                setInput(input + newVal);
            }
        },
        [handleBackspace, input, setInput]
    );

    return (
        <div className="flex gap-2">
            <Textarea
                id={id}
                name={id}
                type="text"
                value={input || ""}
                onValueChange={setInput}
                variant="bordered"
                color={!isValidExpression ? "danger" : "primary"}
                readOnly
                isDisabled={isDisabled}
                isInvalid={!isValidExpression}
            />
            <Popover key="calculator" color="secondary" placement="right">
                <PopoverTrigger>
                    <Button variant="flat" isIconOnly isDisabled={isDisabled} isLoading={isLoading}>
                        <FaCalculator />
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <div className="w-fit p-4">
                        <div className="grid grid-cols-6 gap-2 justify-end">
                            {calcbuttons.map((button, index) => (
                                <Button
                                    color={isNumeric(button) ? "primary" : undefined}
                                    className="w-full"
                                    size="sm"
                                    radius="lg"
                                    isIconOnly
                                    key={index}
                                    onClick={() => handleButtonClick(button)}
                                >
                                    {button}
                                </Button>
                            ))}
                            {var_buttons.map((button, index) => (
                                <Button
                                    className="col-span-2 w-full"
                                    size="sm"
                                    radius="lg"
                                    key={`var-${index}`}
                                    onClick={() => handleButtonClick(button)}
                                >
                                    {button}
                                </Button>
                            ))}
                            {payheadVariables &&
                                payheadVariables.map((button, index) => (
                                    <Button
                                        className="col-span-2 w-full"
                                        size="sm"
                                        radius="lg"
                                        key={`payhead-${index}`}
                                        onClick={() => handleButtonClick(button)}
                                    >
                                        {button}
                                    </Button>
                                ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default PayheadCalculator;
