import React from "react";

// interface CustomInputProps {
//   placeholder?: string;
//   value?: string; // Keep value as string to handle numeric input
//   onChange?: (value: string) => void; // Keep it as string for controlled input
//   onFocus?: () => void;
//   onBlur?: (value: number) => void; // Keep the onBlur value as a number
// }

class CustomInput extends React.Component<React.InputHTMLAttributes<HTMLInputElement>> {
  preventIncrement = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent the default behavior for arrow keys
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
    }
  };

  handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only digits (0-9), negative sign (-), or decimal point (.)
    if (
      !/[\d.-]/.test(e.key) ||
      (e.key === "-" && e.currentTarget.value.includes("-")) ||
      (e.key === "." && e.currentTarget.value.includes("."))
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
  };

  render() {
    return (
      <input
        {...this.props}
        type="text"
        className="w-20 h-full bg-gray-50 p-2 text-sm"
        onFocus={e=>{this.handleFocus(e); this.props.onFocus && this.props.onFocus(e);}}
        onKeyDown={e=> {this.preventIncrement(e); this.props.onKeyDown && this.props.onKeyDown(e);}}
        onKeyPress={e=> {this.handleKeyPress(e); this.props.onKeyPress && this.props.onKeyPress(e)}}
      />
    );
  }
}

export default CustomInput;
