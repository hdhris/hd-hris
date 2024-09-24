import { Switch, cn } from "@nextui-org/react";
import { ChangeEvent } from "react";

interface BorderedSwitchProps {
  label: string;
  description: string;
  isSelected: boolean;
  onChange?: (selected: boolean) => void;
  onValueChange?: (isSelected: boolean) => void;
  className?: string; // optional additional classes
  [key: string]: any; // for spreading additional props
}

export default function BorderedSwitch({
  label,
  description,
  isSelected,
  onChange,
  onValueChange,
  className = "",
  ...props
}: BorderedSwitchProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange && onChange(event.target.checked); // Pass the checked state as a boolean
  };
  return (
    <Switch
      isSelected={isSelected}
      onChange={handleChange}
      onValueChange={onValueChange}
      classNames={{
        base: cn(
          "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
          "justify-between cursor-pointer rounded-lg gap-2 py-2 ps-3 pe-1 border-2 border-transparent",
          "data-[selected=true]:border-success",
          className
        ),
        wrapper: "p-0 h-4 overflow-visible",
        thumb: cn(
          "w-6 h-6 border-2 shadow-lg",
          "group-data-[hover=true]:border-success",
          //selected
          "group-data-[selected=true]:ml-6",
          // pressed
          "group-data-[pressed=true]:w-7",
          "group-data-[selected]:group-data-[pressed]:ml-4"
        ),
      }}
      {...props} // spread additional props here
    >
      <div className="flex flex-col">
        <p className="text-medium">{label}</p>
        <p className="text-tiny text-default-400">{description}</p>
      </div>
    </Switch>
  );
}
