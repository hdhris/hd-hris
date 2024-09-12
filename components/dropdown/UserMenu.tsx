'use client'
import React from 'react';
import {
    Badge, cn, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Skeleton, Tooltip, User
} from "@nextui-org/react";
import {Handshake, Lifebuoy, SignOut, Sliders} from "@phosphor-icons/react";
import {Avatar} from "@nextui-org/avatar";
import {icon_theme, text_icon, text_truncated} from "@/lib/utils";
import Typography from "@/components/common/typography/Typography"
import {LuShieldCheck} from "react-icons/lu";
import Link from "next/link";
import {Chip} from "@nextui-org/chip";
import {PiCloudArrowDown} from "react-icons/pi";
import {useSession} from "next-auth/react";
import {MdOutlinePrivacyTip} from "react-icons/md";
import {IoApps} from "react-icons/io5";
import {logout} from "@/actions/authActions";
import {Button} from "@nextui-org/button";

function UserMenu() {
    const session_server = useSession();

    // Check if session is not loading
    const isLoaded = session_server?.status !== "loading";

    // Get user data with default values
    const name = isLoaded ? session_server?.data?.user?.name ?? "-----" : "-----";
    const email = isLoaded ? session_server?.data?.user?.email ?? "-----" : "-----";
    const pic = isLoaded ? session_server?.data?.user?.picture : undefined;

    return (<Dropdown radius="sm"
        >
            <DropdownTrigger>
                <span className="cursor-pointer">
                    <Badge content="" color="success" shape="circle" placement="bottom-right">
                        <Avatar
                            src={pic}
                            size="sm"
                            showFallback
                            fallback={<Skeleton className="flex rounded-full"/>}
                        />
                    </Badge>
                </span>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Custom item styles"
                disabledKeys={['privileges']}
                className="p-3"
                itemClasses={{
                    base: ["rounded", "text-inactive-bar", "data-[hover=true]:text-active-bar", "data-[hover=true]:hover-bg", "data-[selectable=true]:focus:bg-default-50", "data-[pressed=true]:opacity-70", "data-[focus-visible=true]:ring-default-500"],
                }}
            >
                <DropdownSection aria-label="Profile & Actions" showDivider>
                    <DropdownItem
                        textValue="Profile"
                        isReadOnly
                        key="profile"
                        className="h-14 gap-2 opacity-100 "
                    >
                        <Tooltip content={name}>
                            <User
                                name={name}
                                description={email}
                                classNames={{
                                    name: cn("text-md font-semibold w-32", text_truncated),
                                    description: "text-sm",
                                }}
                                avatarProps={{
                                    size: "sm", src:  `${pic}`,
                                    showFallback: true, fallback: <Skeleton className="flex rounded-full"/>
                                }}
                            />
                        </Tooltip>

                    </DropdownItem>
                    {/*<DropdownItem*/}
                    {/*    as={Link}*/}
                    {/*    href='/preferences'*/}
                    {/*    textValue="Account Settings"*/}
                    {/*    key="account_settings"*/}
                    {/*    startContent={<UserCircleGear className={cn("", icon_theme)}/>}*/}
                    {/*>*/}
                    {/*    <Typography className={text_icon}>Account Settings</Typography>*/}
                    {/*</DropdownItem>*/}
                    <DropdownItem
                        textValue="Preferences"
                        key="preferences"
                        as={Link}
                        href='/preferences'
                        startContent={<Sliders className={cn("", icon_theme)}/>}
                    >
                        <Typography className={text_icon}>Preferences</Typography>
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection aria-label="Profile & Actions" showDivider>
                    <DropdownItem
                        textValue="Privileges"
                        key="privileges"
                        isReadOnly
                        className='opacity-100'
                    >
                        <Chip color='success' className={text_icon}>{isLoaded ? session_server?.data?.user.privilege : "---"}</Chip>
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection showDivider>
                    <DropdownItem
                        textValue="Security"
                        key="security"
                        as={Link}
                        href='/security'
                        startContent={<LuShieldCheck className={cn("", icon_theme)}/>}
                    >
                        <Typography className={text_icon}>Security</Typography>
                    </DropdownItem>
                    <DropdownItem
                        textValue="Privacy Policy"
                        key="privacy-policy"
                        as={Link}
                        href='/privacy-policy'
                        startContent={<MdOutlinePrivacyTip className={cn("", icon_theme)}/>}
                    >
                        <Typography className={text_icon}>Privacy Policy</Typography>
                    </DropdownItem>
                    <DropdownItem
                        textValue="Data Backup"
                        key="data_backup"
                        as={Link}
                        href='/backup'
                        startContent={<PiCloudArrowDown className={cn("", icon_theme)}/>}
                    >
                        <Typography className={text_icon}>Data Backup</Typography>
                    </DropdownItem>
                    <DropdownItem
                        textValue="Apps"
                        key="apps"
                        as={Link}
                        href='/apps'
                        startContent={<IoApps className={cn("", icon_theme)}/>}
                    >
                        <Typography className={text_icon}>Integrations</Typography>
                    </DropdownItem>
                    <DropdownItem
                        textValue="Terms and Condition"
                        key="terms_and_condition"
                        as={Link}
                        href='/terms&condition'
                        startContent={<Handshake className={cn("", icon_theme)}/>}
                    >
                        <Typography className={text_icon}>Terms and Condition</Typography>
                    </DropdownItem>
                    <DropdownItem
                        textValue="Help and Support"
                        key="help_and_support"
                        as={Link}
                        href='/help&support'
                        startContent={<Lifebuoy className={cn("", icon_theme)}/>}
                    >
                        <Typography className={text_icon}>Help and Support</Typography>
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection>
                    <DropdownItem
                        textValue="Log Out"
                        key="logout"
                        className='px-0 py-0'
                    >
                        <form action={logout}>
                           <Button size='sm' variant='light' type='submit' className='w-full justify-start text-sm' startContent={<SignOut className={cn("", icon_theme)}/>}>
                               <Typography className={text_icon}>Log out</Typography>
                           </Button>

                        </form>

                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>);
}

export default UserMenu;