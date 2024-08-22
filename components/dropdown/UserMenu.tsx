'use client'
import React from 'react';
import {
    Badge, cn, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Skeleton, User
} from "@nextui-org/react";
import {Handshake, Lifebuoy, SignOut, Sliders, UserCircleGear} from "@phosphor-icons/react";
import {Avatar} from "@nextui-org/avatar";
import {icon_theme, text_icon} from "@/lib/utils";
import Typography from "@/components/common/typography/Typography"
import {LuShieldAlert, LuShieldCheck} from "react-icons/lu";
import Link from "next/link";
import {Chip} from "@nextui-org/chip";
import {PiCloudArrowDown, PiPlugs} from "react-icons/pi";

function UserMenu() {
    return (<>
        <Dropdown
            radius="sm"
        >
            <DropdownTrigger>
      <span className="cursor-pointer">
        <Badge
            content=""
            color="success"
            shape="circle"
            placement="bottom-right"
        >
          <Avatar
              src="https://avatars.githubusercontent.com/u/30373425?v=4"
              size="sm"
              showFallback
              fallback={<Skeleton className="flex rounded-full"/>}
          />
        </Badge>
      </span>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Custom item styles"
                disabledKeys={["profile", 'privileges']}
                className="p-3"
                itemClasses={{
                    base: ["rounded", "text-inactive-bar", "data-[hover=true]:text-active-bar", "data-[hover=true]:hover-bg", "data-[selectable=true]:focus:bg-default-50", "data-[pressed=true]:opacity-70", "data-[focus-visible=true]:ring-default-500",],
                }}
            >
                <DropdownSection aria-label="Profile & Actions" showDivider>
                    <DropdownItem
                        textValue="Profile"
                        isReadOnly
                        key="profile"
                        className="h-14 gap-2 opacity-100"
                    >
                        <User
                            name="Junior Garcia"
                            description="@jrgarciadev"
                            classNames={{
                                name: "text-inactive-bar text-md font-semibold",
                                description: "text-inactive-bar text-sm",
                            }}
                            avatarProps={{
                                size: "sm", src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                            }}
                        />
                    </DropdownItem>
                    <DropdownItem
                        as={Link}
                        href='/account'
                        textValue="Account Settings"
                        key="account_settings"
                        startContent={<UserCircleGear className={cn("", icon_theme)}/>}
                    >
                        <Typography className={text_icon}>Account Settings</Typography>
                    </DropdownItem>
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
                        <Chip color='success' className={text_icon}>Full Access</Chip>
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
                        textValue="Privacy"
                        key="privacy"
                        as={Link}
                        href='/privacy'
                        startContent={<LuShieldAlert className={cn("", icon_theme)}/>}
                    >
                        <Typography className={text_icon}>Privacy</Typography>
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
                        textValue="Integrations"
                        key="integrations"
                        as={Link}
                        href='/integrations'
                        startContent={<PiPlugs className={cn("", icon_theme)}/>}
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
                        as={Link}
                        href='/api/auth/signout'
                        startContent={<SignOut className={cn("", icon_theme)}/>}
                    >
                        <Typography className={text_icon}>Log out</Typography>
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    </>);
}

export default UserMenu;