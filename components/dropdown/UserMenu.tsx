'use client';
import React, {useEffect, useState} from 'react';
import {
    Badge, cn, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Tooltip, User
} from "@nextui-org/react";

import {Avatar} from "@nextui-org/avatar";
import {icon_theme, text_icon, text_truncated} from "@/lib/utils";
import Typography from "@/components/common/typography/Typography";
import {LuHeartHandshake, LuLifeBuoy, LuLogOut, LuShieldCheck, LuSliders, LuUserCircle2} from "react-icons/lu";
import Link from "next/link";
import {Chip} from "@nextui-org/chip";
import {PiCloudArrowDown} from "react-icons/pi";
import {getSession, signOut, useSession} from "next-auth/react";
import {MdOutlinePrivacyTip} from "react-icons/md";
import {IoApps} from "react-icons/io5";
import {Button} from "@nextui-org/button";

import {logout} from "@/actions/authActions";
import {useCredentials} from "@/hooks/Credentials";
import {useUser} from "@/services/queries";
import {useRouter} from "next/navigation";

interface UserProfile {
    name: string;
    email: string;
    pic: string | null;
    privilege: string | null;
}

export default function UserMenu() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const isCredentials = useCredentials();
    const {data} = useUser()
    const router = useRouter()

    useEffect(() => {
        async function session() {
            const sessionData = await getSession()
            if (sessionData) {
                const user = sessionData.user;
                const name = user?.name ?? "-----";
                const email = user?.email ?? "-----";
                const pic = user?.image ?? null;
                const privilege =  data?.privilege ?? "-----";
                setUserProfile({
                    name, email, pic, privilege
                });
            }

            console.log("Log in...")
            if(data?.isLoggedOut){
                console.log("Log out...")
                await signOut()
            }
        }
        session()

        console.log("Data: ", data)
    }, [data, data?.isLoggedOut, data?.privilege, isCredentials, router]);


    return (<Dropdown radius="sm">
        <DropdownTrigger>
                <span className="cursor-pointer">
                    <Badge content="" color="success" shape="circle" placement="bottom-right">
                        <Avatar
                            src={userProfile?.pic!}
                            size="sm"
                            showFallback
                            fallback={!userProfile?.pic && <LuUserCircle2 className="w-6 h-6 text-default-500" size={20}/>}
                        />
                    </Badge>
                </span>
        </DropdownTrigger>
        <DropdownMenu
            aria-label="Custom item styles"
            className="p-3"
            itemClasses={{
                base: ["rounded", "text-inactive-bar", "data-[hover=true]:text-active-bar", "data-[hover=true]:hover-bg", "data-[selectable=true]:focus:bg-default-50", "data-[pressed=true]:opacity-70", "data-[focus-visible=true]:ring-default-500"],
            }}
        >
            <DropdownSection aria-label="Profile & Actions" showDivider>
                <DropdownItem textValue="Profile" isReadOnly key="profile" className="h-14 gap-2 opacity-100">
                    <Tooltip content={userProfile?.name}>
                        <User
                            name={userProfile?.name}
                            description={userProfile?.email}
                            classNames={{
                                name: cn("text-md font-semibold w-32", text_truncated), description: "text-sm",
                            }}
                            avatarProps={{
                                size: "sm",
                                src: userProfile?.pic!,
                                showFallback: true,
                                fallback: !userProfile?.pic &&
                                    <LuUserCircle2 className="w-6 h-6 text-default-500" size={20}/>
                            }}
                        />
                    </Tooltip>
                </DropdownItem>
                <DropdownItem
                    textValue="Preferences"
                    key="preferences"
                    as={Link}
                    href='/preferences'
                    startContent={<LuSliders className={cn("", icon_theme)}/>}
                >
                    <Typography className={text_icon}>Preferences</Typography>
                </DropdownItem>
            </DropdownSection>
            <DropdownSection aria-label="User Privileges" showDivider>
                <DropdownItem textValue="Privileges" key="privileges" isReadOnly className='opacity-100'>
                    <Chip color='success' className={text_icon}>{userProfile?.privilege ?? "---"}</Chip>
                </DropdownItem>
            </DropdownSection>
            <DropdownSection>
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
                    startContent={<LuHeartHandshake className={cn("", icon_theme)}/>}
                >
                    <Typography className={text_icon}>Terms and Condition</Typography>
                </DropdownItem>
                <DropdownItem
                    textValue="Help and Support"
                    key="help_and_support"
                    as={Link}
                    href='/help&support'
                    startContent={<LuLifeBuoy className={cn("", icon_theme)}/>}
                >
                    <Typography className={text_icon}>Help and Support</Typography>
                </DropdownItem>
            </DropdownSection>
            <DropdownSection>
                <DropdownItem textValue="Log Out" key="logout" className='px-0 py-0'>
                    <form action={logout}>
                        <Button size='sm' variant='light' type='submit' className='w-full justify-start text-sm'
                                startContent={<LuLogOut className={cn("", icon_theme)}/>}
                        >
                            <Typography className={text_icon}>Log out</Typography>
                        </Button>
                    </form>
                </DropdownItem>
            </DropdownSection>
        </DropdownMenu>
    </Dropdown>);
};

