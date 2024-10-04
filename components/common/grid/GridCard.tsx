import { Card, CardBody, CardHeader, cn } from "@nextui-org/react";
import React from "react";
import uniqolor from "uniqolor";
import Pulse, { PulseColorType } from "../effects/Pulse";
import Typography from "../typography/Typography";
import { CheckCircle2, XCircle } from "lucide-react";

const bgGradient = (name: string) => {
  return {
    style: {
      background: uniqolor(name).color,
    },
  };
};

interface GridCardProps<T extends object> {
  name: string;
  items: T[];
  titleSize?: "sm"|"md"|"lg"
  pulseVariant?: PulseColorType;
}

const textSize = {
    lg: "text-2xl",
    md: "text-xl",
    sm: "text-lg",
}

export type GridItemProps = { column?: string; label: string; value: any };

function GridCard<T extends GridItemProps>({
  name,
  pulseVariant,
  items,
  titleSize = "lg",
}: GridCardProps<T>) {
  const isLight = uniqolor(name).isLight;
  return (
    <Card className="w-[250px] h-fit" isHoverable>
      <CardHeader className="p-0">
        <div
          {...bgGradient(name)}
          className={cn(
            "relative flex w-full h-28 rounded-b-sm rounded-r-sm",
            !isLight
              ? "shadow-[inset_-1px_-121px_75px_-52px_rgba(0,0,0,0.49)]"
              : "shadow-[inset_-1px_-121px_75px_-52px_rgba(255,255,255,0.49)]"
          )}
        >
          <div className="flex items-end p-2 gap-4 w-full h-full">
            {pulseVariant && (
              <Pulse color={pulseVariant} />
            )}
            <Typography
              className={cn(
                "w-full font-extrabold break-words overflow-hidden text-pretty",
                isLight ? "text-black" : "text-white",
                textSize[titleSize]
              )}
            >
              {name}
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-hidden">
        <div className={`grid ${items.length > 4 ? '' : items.length > 3 ? 'gap-1' : 'gap-2'}`}>
          {items.map((item) => {
            return (
              <div className="flex justify-between">
                <span className="font-medium text-medium">{item.label}:</span>
                <span className="font-semibold text-medium ">
                  {typeof item.value === "boolean" ? (
                    item.value ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )
                  ) : item.value}
                </span>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

export default GridCard;
