import {
  Avatar,
  AvatarProps,
  Card,
  CardBody,
  CardHeader,
  cn,
} from "@nextui-org/react";
import React, { ReactNode } from "react";
import uniqolor from "uniqolor";
import Pulse, { PulseColorType } from "../effects/Pulse";
import Typography from "../typography/Typography";
import { CheckCircle2, XCircle } from "lucide-react";
import dayjs from "dayjs";
import { Time } from "@/helper/timeParse/timeParse";

const bgGradient = (name: string) => {
  return {
    style: {
      background: uniqolor(name).color,
    },
  };
};

const coverPhoto = (link: string) => {
  return {
    style: {
      background: `url(${link})`, // Set the background image
      backgroundSize: "cover", // Cover the entire element
      backgroundRepeat: "no-repeat", // Prevent the background from repeating
      backgroundPosition: "center", // Center the background image
    },
  };
};

const textSize = {
  lg: "text-2xl",
  md: "text-xl",
  sm: "text-lg",
};

const widthSize = {
  lg: "w-[270px]",
  md: "w-[250px]",
  sm: "w-[230px]",
};

const heightSize = {
  lg: "h-[112px]",
  md: "h-[98px]",
  sm: "h-[90px]",
};

export interface GridItemProps {
  column?: string;
  label: string;
  value: any;
}

interface GridCardProps<T extends object> {
  name: string;
  items: T[];
  size?: "sm" | "md" | "lg";
  background?: string;
  pulseVariant?: PulseColorType;
  deadPulse?: boolean;
  avatarProps?: AvatarProps;
  status?: { label: string; color: PulseColorType };
  bottomShadow?: boolean;
}

function GridCard<T extends GridItemProps>({
  name,
  pulseVariant,
  deadPulse,
  items,
  background,
  avatarProps,
  size = "lg",
  status,
  bottomShadow,
}: GridCardProps<T>) {
  const isLight = uniqolor(name).isLight;
  return (
    <Card className={cn("h-fit", widthSize[size])} isHoverable>
      <CardHeader className="p-0">
        <div
          {...(!background ? bgGradient(name) : coverPhoto(background))}
          className={cn(
            "relative flex w-full rounded h-2-b-sm rounded-r-sm",
            heightSize[size],
            isLight && "brightness-110",
            !bottomShadow
              ? ""
              : !isLight
              ? "shadow-[inset_-1px_-121px_75px_-52px_rgba(0,0,0,0.49)]"
              : "shadow-[inset_-1px_-121px_75px_-52px_rgba(255,255,255,0.49)]"
          )}
        >
          <div className="flex items-end p-2 gap-2 w-full h-full">
            <Typography
              className={cn(
                "flex-1 font-extrabold break-words overflow-hidden text-pretty",
                isLight ? "text-black" : "text-white",
                textSize[size]
              )}
            >
              {name}
            </Typography>
            {avatarProps ? (
              <Avatar
                {...avatarProps}
                className="-mb-5"
                size={size === "sm" ? "md" : "lg"}
              />
            ) : (
              pulseVariant && <Pulse color={pulseVariant} isDead={deadPulse} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-hidden">
        <div
          className={`grid ${
            size == "sm" ? "" : size == "md" ? "gap-1" : "gap-2"
          }`}
        >
          {items.map((item,key) => {
            return (
              <div className="flex justify-between items-center" key={key}>
                <span className="font-medium text-medium">{item.label}:</span>
                <span className="font-semibold text-medium ">
                  {typeof item.value === "boolean" ? ( // Boolean
                    item.value ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )
                  ) : typeof item.value === "object" &&
                    item.value instanceof Date ? (
                    dayjs(item.value).format("MMM D, YYYY") // Date
                  ) : typeof item.value === "object" &&
                    item.value instanceof Time ? (
                    item.value.format("h:mm a")
                  ) : (
                    // Any
                    item.value
                  )}
                </span>
              </div>
            );
          })}
          {status && (
            <div className="flex justify-between">
              <span className="font-medium text-medium">Status:</span>
              <span className="font-semibold text-medium ">
                <span className="capitalize flex gap-1 items-center">
                  {status.label}
                  <Pulse color={status.color} isDead={deadPulse} />
                </span>
              </span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default GridCard;
