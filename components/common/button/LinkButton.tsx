import { cn } from "@nextui-org/react";
import Link from "next/link";
import React, { ReactElement } from "react";

const colorMap = {
  primary: "text-white bg-primary",
  secondary: "text-white bg-secondary",
  warning: "text-black bg-warning",
  danger: "text-white bg-danger",
  default: "text-black bg-default",
};

function LinkButton({
  href,
  children,
  color,
  className,
}: //   size,
{
  href: string;
  color?: "primary" | "secondary" | "warning" | "danger" | "default";
  //   size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactElement | string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-medium text-tiny px-3 py-2.5 hover:contrast-125 transition ease-in-out duration-75",
        colorMap[color || "primary"],
        className
      )}
    >
      {children}
    </Link>
  );
}

export default LinkButton;
