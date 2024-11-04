"use client";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from "@nextui-org/react";
import React, { useState } from "react";
import { calcbuttons, isNumeric, var_buttons } from "./buttons";
import { FaCalculator } from "react-icons/fa";

function PayheadCalculator({
  input,
  setInput,
}: {
  input: string;
  setInput: (value: string) => void;
}) {
  // const [input, setInput] = useState<string>("");
  // const [result, setResult] = useState<number | string>(0);

  // Array to store calculator button values, including backspace ("←")

  const handleButtonClick = (value: string) => {
    if (value === "C") {
      handleClear();
    }
    // else if (value === "=") {
    //   handleCalculate();
    // }
    else if (value === "←") {
      handleBackspace();
    } else {
      const newVal =
        (isNumeric(value) && isNumeric(input.slice(-1))) || input === ""
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
    let val = input.trim(); // Remove leading and trailing spaces

    // Check if the last character is a digit
    const isLastCharNumber = (char: string) => /\d/.test(char);

    // If there's at least one character in the input
    if (val.length > 0) {
      const lastChar = val[val.length - 1];

      // If the last character is a number, remove just that character
      if (isLastCharNumber(lastChar)) {
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

    setInput(val); // Update the input state with the modified value
  };

  //   const handleCalculate = () => {
  //     try {
  //       const calculation = new Function(`return ${input}`)();
  //       setResult(calculation);
  //       setInput(calculation.toString());
  //     } catch (error) {
  //       setResult("Error");
  //     }
  //   };

  return (
    <div className="flex gap-2">
      <Textarea
        type="text"
        value={input}
        onValueChange={setInput}
        variant="bordered"
        color="primary"
        readOnly
      />
      <Popover key="calculator" color="secondary" placement="right">
        <PopoverTrigger>
          <Button variant="flat" isIconOnly>
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
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default PayheadCalculator;
