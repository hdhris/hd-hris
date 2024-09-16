"use client";
import Link from "next/link";
import Typography from "../../components/common/typography/Typography";
import React, { ReactNode } from "react";
import { cn, Tooltip } from "@nextui-org/react";
import { usePathname } from "next/navigation";

interface SidebarItem {
  label: string;
  href: string;
  icon?: ReactNode;
  showLabel?: boolean;
}

export default function SideBarItem({
                                      label,
                                      href,
                                      icon,
                                      showLabel,
                                    }: SidebarItem) {
  const pathname = usePathname();
  const isActive = pathname.includes(href);

  const linkContent = (
      <Link
          href={href}
          className={cn(
              "flex items-center p-2 min-w-14 max-w-52 text-gray-900 rounded-lg group",
              isActive
                  ? "font-semibold bg-primary rounded"
                  : "hover:bg-primary/25 hover:rounded"
          )}
      >
        {icon && (
            <span
                className={cn(
                    "text-gray-500 transition duration-75",
                    isActive ? "text-white font-semibold" : "group-hover:text-gray-900"
                )}
            >
          {icon}
        </span>
        )}
        {showLabel && (
            <Typography
                className={cn(
                    "ms-3 text-sm text-nowrap",
                    isActive ? "text-white" : "group-hover:text-primary"
                )}
            >
              {label}
            </Typography>
        )}
      </Link>
  );

  return (
      <li>
        {showLabel ? (
            linkContent
        ) : (
            <Tooltip content={label} placement="left">
              {linkContent}
            </Tooltip>
        )}
      </li>
  );
}