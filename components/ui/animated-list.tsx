import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {cn} from "@nextui-org/react";

interface AnimatedListProps {
    className?: string;
    children: React.ReactNode;
    delay?: number; // Optional delay (if needed in other scenarios)
}

export const AnimatedList = React.memo(
    ({ className, children}: AnimatedListProps) => {
        const [index, setIndex] = useState(0);
        const childrenArray = React.Children.toArray(children);

        // Trigger animation when children change
        useEffect(() => {
            setIndex(childrenArray.length); // Reset the index when children change
        }, [childrenArray.length]);

        const itemsToShow = useMemo(
            () => childrenArray.slice(0, index + 1).reverse(),
            [index, childrenArray],
        );

        return (
            <div className={cn("flex flex-col items-center gap-4", className)}>
                <AnimatePresence>
                    {itemsToShow.map((item) => (
                        <AnimatedListItem key={(item as React.ReactElement).key}>
                            {item}
                        </AnimatedListItem>
                    ))}
                </AnimatePresence>
            </div>
        );
    },
);

AnimatedList.displayName = "AnimatedList";

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
    const animations = {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1, originY: 0 },
        exit: { scale: 0, opacity: 0 },
        transition: { type: "spring", stiffness: 350, damping: 40 },
    };

    return (
        <motion.div {...animations} layout className="mx-auto w-full">
            {children}
        </motion.div>
    );
}
