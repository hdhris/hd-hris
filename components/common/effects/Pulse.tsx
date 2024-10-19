import React from 'react';
import { cn } from "@nextui-org/react";

const pulseColorMap = {
    danger: {
        parent: "bg-danger-500",
        child: "bg-danger-400",
    },
    orange: {
        parent: "bg-orange-500",
        child: "bg-orange-400",
    },
    yellow: {
        parent: "bg-yellow-500",
        child: "bg-yellow-400",
    },
    success: {
        parent: "bg-success-500",
        child: "bg-success-400",
    },
    blue: {
        parent: "bg-blue-500",
        child: "bg-blue-400",
    },
    purple: {
        parent: "bg-purple-500",
        child: "bg-purple-400",
    },
    pink: {
        parent: "bg-pink-500",
        child: "bg-pink-400",
    },
    gray: {
        parent: "bg-gray-500",
        child: "bg-gray-400",
    },
    indigo: {
        parent: "bg-indigo-500",
        child: "bg-indigo-400",
    },
    lightBlue: {
        parent: "bg-blue-500",
        child: "bg-blue-400",
    },
    lightGreen: {
        parent: "bg-green-500",
        child: "bg-green-400",
    },
    lightOrange: {
        parent: "bg-orange-500",
        child: "bg-orange-400",
    },
    lightPink: {
        parent: "bg-pink-500",
        child: "bg-pink-400",
    },
} as const;  // <--- This makes the object readonly, inferring literal types.

export type PulseColorType = keyof typeof pulseColorMap; // This restricts the color to the keys of pulseColorMap

function Pulse({ color,isDead }: { color?: PulseColorType; isDead?: boolean }) {
    const pulseColor = color ? pulseColorMap[color] : pulseColorMap["gray"];

    return (
    <div className="relative m-2">
      <span className="absolute -top-3 -right-2 size-3">
        <span
            className={cn(
                "animate-ping absolute -right-1 -top-0 inline-flex h-5 w-5 rounded-full opacity-75",
                pulseColor.child,
                isDead ? 'invisible' : '',
            )}
        ></span>
        <span
            className={cn(
                "relative inline-flex rounded-full h-3 w-3",
                pulseColor.parent
            )}
        ></span>
      </span>
    </div>
    );
}

export default Pulse;
