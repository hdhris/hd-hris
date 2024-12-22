import { CSSProperties } from "react";
import { getColor } from "@/helper/background-color-generator/generator";

type colorType = "danger" | "success" | "default" | "warning" | "primary" | "secondary";

type sizeType = "md" | "sm" | "lg";
type radiusType = "md" | "sm" | "lg" | "full" | "none";
type variantType = "flat" | "solid" | "bordered" | "light" | "faded" | "shadow" | "ghost" | undefined;

interface uniformProps {
    size?: sizeType;
    radius?: radiusType;
    color?: colorType;
    variant?: variantType;
}

export const uniformStyle = ({ size = "sm", radius = "sm", color = "primary", variant = "solid" }: uniformProps = {}) => {
    return {
        size: size,
        radius: radius,
        color: color,
        variant: variant,
    };
};

export const uniformChipStyle = (name: string) => {
    return {
        style: {
            background: getColor(name, 0.2),
            borderColor: getColor(name, 0.5),
            color: getColor(name),
        },
    };
};
