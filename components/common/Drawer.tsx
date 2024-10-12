"use client";

import * as React from "react";
import {ReactNode} from "react";
import {Dialog, DialogBackdrop, DialogPanel, DialogTitle,} from "@headlessui/react";
import {LuX} from "react-icons/lu";
import {Button} from "@nextui-org/button";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {cn} from "@nextui-org/react";

interface DrawerProps {
    isOpen: boolean;
    onClose: (value: boolean) => void;
    children: ReactNode;
    footer?: ReactNode;
    title: string | ReactNode;
    isDismissible?: boolean;
    size?: "sm" | "md" | "lg";
    isSubmitting?: boolean
}

const sizeMap = {
    lg: "md:min-w-[900px]",
    md: "md:min-w-[650px]",
    sm: "md:min-w-[400px]",
}

const Drawer = ({
                    isOpen,
                    onClose,
                    children,
                    title,
                    isDismissible,
                    footer,
                    size,
                    isSubmitting
                }: DrawerProps) => {
    // Prevent closing when clicking outside by removing onClose from Dialog
    return (
        <Dialog
            open={isOpen}
            onClose={isDismissible ? onClose : () => {
            }}
            className="relative z-10"
        >
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
            />
            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <DialogPanel
                            transition
                            className={cn(
                                "pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700",
                                size && sizeMap[size]
                            )}
                        >
                            <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 pt-2 shadow-xl">
                                <div className="flex justify-between px-4">
                                    <DialogTitle
                                        className="text-base self-center font-semibold leading-6 text-gray-900">
                                        {title}
                                    </DialogTitle>
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        onClick={() => onClose(false)}
                                    >
                                        <LuX className="h-4 w-4"/>
                                    </Button>
                                </div>

                                <div className="relative mt-6 flex-1 overflow-hidden px-4 sm:px-6">
                                    <ScrollShadow className="h-full overflow-y-auto pr-4">
                                        {children}
                                    </ScrollShadow>
                                </div>

                                <div className="flex w-full items-center px-4 sm:px-6">
                                    {/* <SheetClose asChild>{footer}</SheetClose> */}
                                    {footer ? (
                                        footer
                                    ) : (
                                        <Button
                                            isLoading={isSubmitting}
                                            {...uniformStyle()}
                                            type="submit"
                                            form="drawer-form"
                                            className="ms-auto"
                                        >
                                            Submit
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default Drawer;
