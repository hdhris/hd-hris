"use client";

import {Avatar, CardProps} from "@nextui-org/react";

import React from "react";
import {Card, CardBody} from "@nextui-org/react";
import {cn} from "@nextui-org/react";

export type ActionCardProps = CardProps & {
    title: string;
    color?: "primary" | "secondary" | "warning" | "danger";
    description: string;
    src: string
};

const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
    ({color, title, description, children, className, src, ...props}, ref) => {
        const colors = React.useMemo(() => {
            switch (color) {
                case "primary":
                    return {
                        card: "border-default-200",
                        iconWrapper: "bg-transparent border-primary-100",
                        icon: "text-primary",
                    };
                case "secondary":
                    return {
                        card: "border-secondary-100",
                        iconWrapper: "bg-transparent border-secondary-100",
                        icon: "text-secondary",
                    };
                case "warning":
                    return {
                        card: "border-warning-500",
                        iconWrapper: "bg-transparent border-warning-100",
                        icon: "text-warning-600",
                    };
                case "danger":
                    return {
                        card: "border-danger-300",
                        iconWrapper: "bg-transparent border-danger-100",
                        icon: "text-danger",
                    };

                default:
                    return {
                        card: "border-default-200",
                        iconWrapper: "bg-transparent border-default-100",
                        icon: "text-default-500",
                    };
            }
        }, [color]);

        return (
            <Card
                ref={ref}
                className={cn("w-full bg-transparent", colors?.card, className)}
                shadow="none"
                {...props}
            >
                <CardBody className="flex h-full flex-row items-start gap-3">
                    <div className={cn("item-center flex", colors?.iconWrapper)}>
                        <Avatar
                            src={src}
                            size="sm"
                        />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-medium">{title}</p>
                        <p className="text-small text-default-400">{description || children}</p>
                    </div>
                </CardBody>
            </Card>
        );
    },
);

ActionCard.displayName = "ActionCard";

export default ActionCard;
