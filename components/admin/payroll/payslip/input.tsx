import { cn } from "@nextui-org/react";
import React from "react";

// interface CustomInputProps {
//   placeholder?: string;
//   value?: string; // Keep value as string to handle numeric input
//   onChange?: (value: string) => void; // Keep it as string for controlled input
//   onFocus?: () => void;
//   onBlur?: (value: number) => void; // Keep the onBlur value as a number
// }

class CustomInput extends React.Component<
  React.InputHTMLAttributes<HTMLInputElement>
> {
  preventIncrement = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent the default behavior for arrow keys
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      this.handleVerticalNavigation(e);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      this.handleHorizontalNavigation(e);
    }
  };

  handleVerticalNavigation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentInput = e.currentTarget;
    const cell = currentInput.closest("td");
    if (!cell) return;

    const row = cell.parentElement;
    if (!row) return;

    const cellIndex = Array.from(row.children).indexOf(cell);
    let targetRow =
      e.key === "ArrowUp" ? row.previousElementSibling : row.nextElementSibling;

    // Keep moving in the specified direction until we find an input
    while (targetRow) {
      const targetCell = targetRow.children[cellIndex] as HTMLElement;
      const targetInput = targetCell.querySelector("input") as HTMLInputElement;

      if (targetInput) {
        targetInput.focus();
        return;
      }
      targetRow =
        e.key === "ArrowUp"
          ? targetRow.previousElementSibling
          : targetRow.nextElementSibling;
    }
  };

  handleHorizontalNavigation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    let cell = e.currentTarget.closest("td");
    if (!cell) return;

    // Keep moving left or right until we find a cell with an input
    let targetCell =
      e.key === "ArrowLeft"
        ? cell.previousElementSibling
        : cell.nextElementSibling;
    while (targetCell) {
      const targetInput = targetCell.querySelector("input") as HTMLInputElement;

      if (targetInput) {
        targetInput.focus();
        return;
      }
      targetCell =
        e.key === "ArrowLeft"
          ? targetCell.previousElementSibling
          : targetCell.nextElementSibling;
    }
  };

  handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { value, selectionStart } = e.currentTarget;
    // Allow only digits (0-9), negative sign (-), or decimal point (.)
    // Prevent multiple negative signs, or decimal points
    // Ensure negative sign can only be at the start of the input
    if (
      !/[\d.-]/.test(e.key) || // Restrict non-numeric, non-"-", non-"." characters
      (e.key === "-" && (value.includes("-") || selectionStart !== 0)) || // Allow "-" only at the beginning
      (e.key === "." && value.includes(".")) // Allow only one "."
    ) {
      e.preventDefault();
    }
  };

  handleFocus(event: React.FocusEvent<HTMLInputElement>) {
    event.target.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  render() {
    return (
      <input
        {...this.props}
        type="text"
        className={
          "w-24 h-full bg-gray-50 p-2 text-sm " + (this.props.className || "")
        }
        onFocus={(e) => {
          this.handleFocus(e);
          this.props.onFocus && this.props.onFocus(e);
        }}
        onKeyDown={(e) => {
          this.preventIncrement(e);
          this.props.onKeyDown && this.props.onKeyDown(e);
        }}
        onKeyPress={(e) => {
          this.handleKeyPress(e);
          this.props.onKeyPress && this.props.onKeyPress(e);
        }}
      />
    );
  }
}

export default CustomInput;

export function PayrollInputColumn({...props}: {
  uniqueKey?: string | number;
  payheadId?: number;
  employeeId?: number;
  setFocusedPayhead: (id: number) => void;
  type?: "earning" | "deduction";
  unUpdated?: boolean;
  value: string | number;
  handleBlur: (employeeId: number, payheadId: number, value: number) => void;
  handleRecording?: (
    employeeId: number,
    payheadId: number,
    value: ["earning" | "deduction", string]
  ) => void;
  readOnly: boolean;
  className?: string;
}) {
  return (
    <td key={props.uniqueKey} className="z-30">
      <CustomInput
        className={cn("border-1", props.unUpdated? "border-red-500":"border-gray-50",props.className)}
        readOnly={props.readOnly}
        value={props.value}
        placeholder={"0"}
        onFocus={() => props.payheadId && props.setFocusedPayhead(props.payheadId)}
        onBlur={(e) =>
          props.payheadId &&
          props.employeeId &&
          props.handleBlur(props.employeeId, props.payheadId, parseFloat(e.target.value) || 0)
        }
        onChange={(e) =>
          props.payheadId &&
          props.employeeId &&
          props.type &&
          props.handleRecording &&
          props.handleRecording(props.employeeId, props.payheadId, [props.type, e.target.value])
        }
      />
    </td>
  );
}
