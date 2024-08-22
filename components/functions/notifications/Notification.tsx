'use client'
import React from 'react';
import {
    Badge,
    Button,
    cn,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger, ScrollShadow, User
} from "@nextui-org/react";
import {IoIosNotifications} from "react-icons/io";
import {icon_size, icon_size_sm, text_icon} from "@/lib/utils";
import Typography from "@/components/common/typography/Typography"
import {BsCheck2All} from "react-icons/bs";
import {LuCheckCheck, LuSettings} from "react-icons/lu";
import {getDateRequestedAgo, getRandomDateTime} from "@/lib/utils/dateFormatter";
import Link from "next/link";


function Notification() {
    return (

        <Dropdown radius="sm" className="bg-white">
            <DropdownTrigger>
                <span className="cursor-pointer">
                    <Badge content={10} color='danger' size="sm">
                        <IoIosNotifications className={cn("text-primary", icon_size)}/>
                    </Badge>
                </span>
            </DropdownTrigger>
            <DropdownMenu variant="faded"
                          className="h-96"
                          aria-label="Dropdown menu with description"
                          itemClasses={{
                              base: [
                                  "rounded",
                                  "text-inactive-bar",
                                  "transition-opacity",
                                  "data-[hover=true]:text-white",
                                  "data-[hover=true]:bg-primary/25",
                                  "dark:data-[hover=true]:bg-default-50",
                                  "data-[selectable=true]:focus:bg-default-50",
                                  "data-[pressed=true]:opacity-70",
                                  "data-[focus-visible=true]:ring-default-500",
                              ],
                          }}
            >
                <DropdownItem
                    className="px-0 opacity-100 w-96
                    cursor-default
                    hover:!border-transparent
                    data-[hover=true]:!bg-transparent
                    "
                    key="title"
                >
                    <div className="flex items-center justify-between px-2">
                        <Typography className="font-semibold text-2xl text-inactive-bar">Notifications</Typography>
                        <Link href="/" className="w-fit h-fit text-primary flex items-center gap-2"><LuCheckCheck className='text-primary'/>Mark all as read</Link>
                    </div>
                </DropdownItem>
                <DropdownSection showDivider>
                    <DropdownItem
                        className="w-96"
                        key="copy"
                    >
                        <User
                            className="group w-full justify-start"
                            name={
                                <div className="flex items-center justify-between">
                                    <Typography className={text_icon}>Subject</Typography>
                                    <Typography className={cn("text-tiny font-normal opacity-75", text_icon)}>
                                        {getDateRequestedAgo(
                                            getRandomDateTime(
                                                new Date("4/13/2024, 12:00:00 AM"),
                                                new Date("5/13/2024, 12:00:52 PM")
                                            ),
                                            true
                                        )}
                                    </Typography>
                                </div>
                            }
                            description="content hhjhdjkjdkkkdkldklkdlkdlddlkldklkdlkdlkdkdldhjdhjhdjdjdj"
                            classNames={{
                                wrapper: "w-full",
                                name: "text-primary text-md font-semibold group-hover:hover-text w-full",
                                description: "text-primary text-sm group-hover:hover-text w-72 truncate overflow-hidden text-ellipsis whitespace-nowrap",
                            }}
                            avatarProps={{
                                size: "sm",
                                src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                            }}
                        />


                    </DropdownItem>
                </DropdownSection>
                <DropdownSection showDivider>
                    <DropdownItem
                        className="w-96"
                        key="copy"
                    >
                        <User
                            className="group w-full justify-start"
                            name={
                                <div className="flex items-center justify-between">
                                    <Typography className={text_icon}>Subject</Typography>
                                    <Typography className={cn("text-tiny font-normal opacity-75", text_icon)}>
                                        {getDateRequestedAgo(
                                            getRandomDateTime(
                                                new Date("4/13/2024, 12:00:00 AM"),
                                                new Date("5/13/2024, 12:00:52 PM")
                                            ),
                                            true
                                        )}
                                    </Typography>
                                </div>
                            }
                            description="content hhjhdjkjdkkkdkldklkdlkdlddlkldklkdlkdlkdkdldhjdhjhdjdjdj"
                            classNames={{
                                wrapper: "w-full",
                                name: "text-primary text-md font-semibold group-hover:hover-text w-full",
                                description: "text-primary text-sm group-hover:hover-text w-72 truncate overflow-hidden text-ellipsis whitespace-nowrap",
                            }}
                            avatarProps={{
                                size: "sm",
                                src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                            }}
                        />


                    </DropdownItem>
                </DropdownSection>
                <DropdownSection showDivider>
                    <DropdownItem
                        className="w-96"
                        key="copy"
                    >
                        <User
                            className="group w-full justify-start"
                            name={
                                <div className="flex items-center justify-between">
                                    <Typography className={text_icon}>Subject</Typography>
                                    <Typography className={cn("text-tiny font-normal opacity-75", text_icon)}>
                                        {getDateRequestedAgo(
                                            getRandomDateTime(
                                                new Date("4/13/2024, 12:00:00 AM"),
                                                new Date("5/13/2024, 12:00:52 PM")
                                            ),
                                            true
                                        )}
                                    </Typography>
                                </div>
                            }
                            description="content hhjhdjkjdkkkdkldklkdlkdlddlkldklkdlkdlkdkdldhjdhjhdjdjdj"
                            classNames={{
                                wrapper: "w-full",
                                name: "text-primary text-md font-semibold group-hover:hover-text w-full",
                                description: "text-primary text-sm group-hover:hover-text w-72 truncate overflow-hidden text-ellipsis whitespace-nowrap",
                            }}
                            avatarProps={{
                                size: "sm",
                                src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                            }}
                        />


                    </DropdownItem>
                </DropdownSection>
                <DropdownSection showDivider>
                    <DropdownItem
                        className="w-96"
                        key="copy"
                    >
                        <User
                            className="group w-full justify-start"
                            name={
                                <div className="flex items-center justify-between">
                                    <Typography className={text_icon}>Subject</Typography>
                                    <Typography className={cn("text-tiny font-normal opacity-75", text_icon)}>
                                        {getDateRequestedAgo(
                                            getRandomDateTime(
                                                new Date("4/13/2024, 12:00:00 AM"),
                                                new Date("5/13/2024, 12:00:52 PM")
                                            ),
                                            true
                                        )}
                                    </Typography>
                                </div>
                            }
                            description="content hhjhdjkjdkkkdkldklkdlkdlddlkldklkdlkdlkdkdldhjdhjhdjdjdj"
                            classNames={{
                                wrapper: "w-full",
                                name: "text-primary text-md font-semibold group-hover:hover-text w-full",
                                description: "text-primary text-sm group-hover:hover-text w-72 truncate overflow-hidden text-ellipsis whitespace-nowrap",
                            }}
                            avatarProps={{
                                size: "sm",
                                src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                            }}
                        />


                    </DropdownItem>
                </DropdownSection>
                <DropdownItem
                    className="px-0 opacity-100 w-96
                    cursor-default
                    hover:!border-transparent
                    data-[hover=true]:!bg-transparent
                    "
                    key="title"
                >
                    <div className="flex items-center justify-between px-2">
                        <Link href='/' className="w-fit h-fit text-primary underline">View all notifications</Link>
                        <Link href='/' className="w-fit h-fit text-primary"><LuSettings /></Link>
                    </div>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}

export default Notification;