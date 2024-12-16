import {CSSProperties} from "react";
import {getColor} from "@/helper/background-color-generator/generator";

type colorType =
  | "danger"
  | "success"
  | "default"
  | "warning"
  | "primary"
  | "secondary";
  
type sizeType = "md" | "sm" | "lg" ;
type radiusType = "md" | "sm" | "lg" | "full" | "none";

interface uniformProps {
  size?: sizeType;
  radius?: radiusType;
  color?: colorType;
}

export const uniformStyle = ({
  size = "sm",
  radius = "sm",
  color = "primary",
}: uniformProps = {}) => {
  return {
    size: size,
    radius: radius,
    color: color,
  };
};


export const uniformChipStyle = (name: string) => {
  return {
    style: {
      background: getColor(name, 0.2),
      borderColor: getColor(name, 0.5),
      color: getColor(name)
    }
  }
}
