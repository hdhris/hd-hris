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
import dayjs from "dayjs";
import { Time } from "@/helper/timeParse/datetimeParse";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { LuCheckCircle2, LuXCircle } from "react-icons/lu";
import DropdownList, { DropdownListItemProp } from "../Dropdown";
import { BsThreeDotsVertical } from "react-icons/bs";

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
const wideWidthSize = {
  lg: "w-[300px]",
  md: "w-[280px]",
  sm: "w-[260px]",
};

const heightSize = {
  lg: "h-[112px]",
  md: "h-[98px]",
  sm: "h-[90px]",
};
const wideHeightSize = {
  lg: "h-[100px]",
  md: "h-[88px]",
  sm: "h-[78px]",
};

export interface GridItemProps {
  column?: string;
  label: string;
  value: any;
}

interface GridCardProps<T extends object> {
  id: string | number;
  name: string;
  items: T[];
  size?: "sm" | "md" | "lg";
  background?: string;
  pulseVariant?: PulseColorType;
  deadPulse?: boolean;
  avatarProps?: AvatarProps;
  status?: { label: string; color: PulseColorType };
  bottomShadow?: boolean;
  wide?: boolean;
  actionList?: DropdownListItemProp[];
  onPress?: ()=> void;
}

function GridCard<T extends GridItemProps>({
  onPress,
  name,
  pulseVariant,
  deadPulse,
  items,
  background,
  avatarProps,
  size = "lg",
  status,
  bottomShadow,
  wide,
  actionList,
}: GridCardProps<T>) {
  const isLight = uniqolor(name).isLight;
  return (
    <Card
      className={cn("h-fit", wide ? wideWidthSize[size] : widthSize[size])}
      isHoverable
      isPressable={onPress!=undefined}
      onPress={()=>onPress&&onPress()}
    >
      <CardHeader className="p-0 -z-1">
        <div
          {...(!background ? bgGradient(name) : coverPhoto(background))}
          className={cn(
            "relative flex w-full rounded h-2-b-sm rounded-r-sm",
            wide ? wideHeightSize[size] : heightSize[size],
            isLight && "shadow-[inset_10px_10px_5px_172px_rgba(0,0,0,0.06)];",
            !bottomShadow
              ? ""
              : !isLight
              ? "shadow-[inset_-1px_-121px_75px_-52px_rgba(0,0,0,0.49)]"
              : "shadow-[inset_-1px_-121px_75px_-52px_rgba(255,255,255,0.49)]"
          )}
        >
          <div className="relative flex items-end p-2 gap-2 w-full h-full">
            {actionList && <DropdownList
              trigger={{
                icon: <BsThreeDotsVertical size={18}/>,
                class: "absolute top-0 right-0 text-white",
              }}
              items={actionList}
            />}
            <Typography
              className={cn(
                "flex-1 font-extrabold break-words overflow-hidden text-pretty text-start text-white",
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
            size == "sm" ? "gap-2" : size == "md" ? "gap-3" : "gap-4"
          }`}
        >
          {items.map((item, key) => {
            return (
              <div className="flex justify-between items-center" key={key}>
                <span className="text-medium">{item.label}:</span>
                <span className="font-semibold text-medium ">
                  {typeof item.value === "boolean" ? ( // Boolean
                    item.value ? (
                      <LuCheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <LuXCircle className="h-5 w-5 text-red-500" />
                    )
                  ) : typeof item.value === "object" &&
                    item.value instanceof Date ? (
                    toGMT8(item.value).format("MMM D, YYYY") // Date
                  ) : typeof item.value === "object" &&
                    item.value instanceof Time ? (
                    toGMT8(item.value.toISOString).format("h:mm a")
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
