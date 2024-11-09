"use client";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from "@nextui-org/react";
import React, { useMemo } from "react";
import { calcbuttons, isNumeric, isValidAdjacent, var_buttons } from "./buttons";
import { FaCalculator } from "react-icons/fa";
import { BaseValueProp, calculateAllPayheads } from "@/helper/payroll/calculations";

function PayheadCalculator({
  payhead,
  input,
  setInput,
  payheadVariables,
  setInvalid,
}: {
  payhead: {
    id: number;
    system_only?: boolean;
  };
  input: string;
  setInput: (value: string) => void;
  payheadVariables?: string[];
  setInvalid: (value: boolean) => void;
}) {

  // Ignore system variables that can update calculations
  // 51 : Basic Salary
  const isDisabled = useMemo(()=>{
    if(payhead)
      return [51].includes(payhead.id)===false && payhead.system_only;

    return false;
  },[payhead]);

  const isValidExpression = useMemo(()=>{
    if(input.trim() === ""){
      setInvalid(false);
      return true
    }
    // type ExtendedBaseValueProp = BaseValueProp & { [key: string]: number };
    const baseVariables: BaseValueProp = {
      rate_p_hr: 1,
      total_shft_hr: 1,
      payroll_days: 1,
      ...payheadVariables?.reduce((acc, variable, index) => {
        acc[variable] = 1;
        return acc;
      }, {} as Record<string, number>)
    };

    if (isDisabled) return true;
    const vals = calculateAllPayheads(baseVariables, [{payhead_id: -1, formula: input, variable:"x"}], true);
    if(vals.length){
      setInvalid(false);
      return true;
    }
    
    setInvalid(true);
    return false;
  },[input, payheadVariables, setInvalid, isDisabled])

  const handleButtonClick = (value: string) => {
    if (value === "C") {
      handleClear();
    }
    else if (value === "←") {
      handleBackspace();
    } else {
      const newVal =
        (isValidAdjacent(value) && isValidAdjacent(input.slice(-1))) || input === ""
          ? value
          : ` ${value}`;
      setInput(input + newVal);
    }
  };

  const handleClear = () => {
    setInput("");
    // setResult(0);
  };

  const handleBackspace = () => {
    let val = input.trim();
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
  };

  return (
    <div className="flex gap-2">
      <Textarea
        type="text"
        value={input}
        onValueChange={setInput}
        variant="bordered"
        color={!isValidExpression ? "danger" : "primary"}
        readOnly
        isDisabled={isDisabled}
        isInvalid={!isValidExpression}
      />
      <Popover key="calculator" color="secondary" placement="right">
        <PopoverTrigger>
          <Button variant="flat" isIconOnly isDisabled={isDisabled}>
            <FaCalculator />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="w-fit p-4">
            <div className="grid grid-cols-4 gap-2 justify-end">
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
              {payheadVariables && payheadVariables.map((button, index) => (
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
