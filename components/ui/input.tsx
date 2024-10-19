import * as React from "react";
import { Input as NextUIInput, InputProps as NextUIInputProps } from "@nextui-org/react";

// Extending NextUI's InputProps to customize the value type
export interface CustomInputProps extends Omit<NextUIInputProps, "value"> {
    value?: string | number; // Modify the value type here
}

const Input = React.forwardRef<HTMLInputElement, CustomInputProps>(
    ({ value, ...props }, ref) => {
        return (
            <NextUIInput
                ref={ref}
                value={typeof value === "number" ? String(value) : value} // Convert number to string
                {...props}   // Spread other props
            />
        );
    }
);

Input.displayName = "Input";

export { Input };
