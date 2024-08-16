'use client'
import React from 'react';
import {
    Badge,
    cn,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Skeleton,
    User
} from "@nextui-org/react";
import {Handshake, Lifebuoy, SignOut, Sliders, UserCircleGear} from "@phosphor-icons/react";
import {Avatar} from "@nextui-org/avatar";
import {icon_theme, text_icon} from "@/lib/utils";
import Text from "@/components/common/typography/Text"
import {LuShieldCheck} from "react-icons/lu";
import {PiUserSwitch} from "react-icons/pi";

function UserMenu() {
    return (
        <Dropdown radius="sm" className="bg-white">
            <DropdownTrigger>
                <span className="cursor-pointer">
                    <Badge content="" color="success" shape="circle" placement="bottom-right">
                        <Avatar src="https://avatars.githubusercontent.com/u/30373425?v=4" size="sm" showFallback fallback={<Skeleton className="flex rounded-full"/>}/>
                    </Badge>
                </span>

            </DropdownTrigger>
            <DropdownMenu
                aria-label="Custom item styles"
                disabledKeys={["profile"]}
                className="p-3"
                itemClasses={{
                    base: [
                        "rounded",
                        "text-inactive-bar",
                        "data-[hover=true]:text-active-bar",
                        "data-[hover=true]:hover-bg",
                        "data-[selectable=true]:focus:bg-default-50",
                        "data-[pressed=true]:opacity-70",
                        "data-[focus-visible=true]:ring-default-500",
                    ],
                }}
            >
                <DropdownSection aria-label="Profile & Actions" showDivider>
                    <DropdownItem
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
                                size: "sm",
                                src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                            }}
                        />
                    </DropdownItem>
                    <DropdownItem key="account_settings" startContent={<UserCircleGear className={cn("", icon_theme)}/>}>
                        <Text className={text_icon}>Account Settings</Text>
                    </DropdownItem>
                    <DropdownItem key="preferences" startContent={<Sliders className={cn("", icon_theme)}/>}><Text className={text_icon}>Preferences</Text></DropdownItem>
                </DropdownSection>
                {/*<DropdownSection showDivider>*/}
                {/*    <DropdownItem key="onEmployeeMode" startContent={<PiUserSwitch className={cn("", icon_theme)}/>}><Text className={text_icon}>Switch As Employee</Text></DropdownItem>*/}
                {/*</DropdownSection>*/}
                <DropdownSection showDivider>
                    <DropdownItem key="security_and_privacy"
                                  startContent={<LuShieldCheck className={cn("", icon_theme)}/>}
                    ><Text className={text_icon}>Security and Privacy</Text></DropdownItem>
                    <DropdownItem key="terms_and_condition"

                                  startContent={<Handshake className={cn("", icon_theme)}/>}
                    ><Text className={text_icon}>Terms and Condition</Text></DropdownItem>
                    <DropdownItem key="help_and_support"
                                  startContent={<Lifebuoy className={cn("", icon_theme)}/>}
                    ><Text className={text_icon}>Help and Support</Text></DropdownItem>
                </DropdownSection>
                <DropdownSection>
                    <DropdownItem key="logout"  startContent={<SignOut className={cn("", icon_theme)}/>}><Text className={text_icon}>Log out</Text></DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    );
}

export default UserMenu;