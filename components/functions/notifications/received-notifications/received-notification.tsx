"use client";


import {AnimatedList} from "@/components/ui/animated-list";
import {Avatar, Badge, cn} from "@nextui-org/react";
import React from "react";
import toast from "react-hot-toast";

interface Item {
    name: string;
    src: string;
    // color: string;
    time: string;
    key: React.Key
    is_unread: boolean
}

let notifications = [
    {
        name: "Payment received",
        description: "Magic UI",
        time: "15m ago",

        icon: "💸",
        color: "#00C9A7",
    },
    {
        name: "User signed up",
        description: "Magic UI",
        time: "10m ago",
        icon: "👤",
        color: "#FFB800",
    },
    {
        name: "New message",
        description: "Magic UI",
        time: "5m ago",
        icon: "💬",
        color: "#FF3D71",
    },
    {
        name: "New event",
        description: "Magic UI",
        time: "2m ago",
        icon: "🗞️",
        color: "#1E86FF",
    },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

export const NotificationList = ({ name, src, time, key, is_unread }: Item) => {
    return (
        <figure
            key={key}
            className={cn(
                is_unread ? "bg-default-400/20" : "bg-white",
                "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
                // animation styles
                "transition-all duration-200 ease-in-out hover:scale-[103%]",
                // light styles
                 "[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
                // dark styles
                "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
            )}
        >
            <div className="flex flex-row items-center gap-3">
                <div className="max-w-14 flex self-start">
                        <Avatar
                            src={src}
                            className="ml-3"
                            size="md"
                        />

                </div>
                <div className="flex flex-col overflow-hidden gap-1">
                    <figcaption
                        className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
                        <span className="text-base break-words whitespace-normal">{name}</span>
                    </figcaption>
                    <span className="text-xs text-gray-500">{time}</span>
                </div>
            </div>
        </figure>
    );
};

// export function Notification Lis({
//                                      className,
//                                  }: {
//     className?: string;
// }) {
//     return (
//         <div
//             className={cn(
//                 "relative flex h-[500px] w-full flex-col p-6 overflow-hidden rounded-lg border bg-background md:shadow-xl",
//                 className,
//             )}
//         >
//             <AnimatedList>
//                 {notifications.map((item, idx) => (
//                     <Notification {...item} key={idx} />
//                 ))}
//             </AnimatedList>
//         </div>
//     );
// }
