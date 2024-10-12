import {Switch, SwitchProps, cn} from "@nextui-org/react";

interface BorderedSwitchProps {
  label: string;
  description?: string;
}

export default function BorderedSwitch({
  label,
  description,
  ...props
}: BorderedSwitchProps & SwitchProps) {
  return (
    <Switch
      classNames={{
        base: cn(
          "inline-flex flex-row-reverse w-full min-w-full bg-content1 hover:bg-content2 items-center",
          "justify-between cursor-pointer rounded-lg gap-2 py-2 px-3 border-2 border-transparent",
          "data-[selected=true]:border-primary",
          "rounded-xl",
        ),
        wrapper: "p-0 h-4 overflow-visible",
        thumb: cn("w-6 h-6 border-2 shadow-lg",
          "group-data-[hover=true]:border-primary",
          //selected
          "group-data-[selected=true]:ml-6",
          // pressed
          "group-data-[pressed=true]:w-7",
          "group-data-[selected]:group-data-[pressed]:ml-4",
        ),
      }}
      {...props}
    >
      <div className="flex flex-col justify-center">
        <p className="text-sm font-semibold">{label}</p>
        {description && <p className="text-tiny text-default-400">
          {description}
        </p>}
      </div>
    </Switch>
  );
}