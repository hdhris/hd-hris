'use client'
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Typography, {Heading, Section} from "@/components/common/typography/Typography";
import {Button} from "@nextui-org/button";
import {cn, Listbox, ListboxItem, SharedSelection, Switch, Tooltip} from '@nextui-org/react';
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {Avatar} from "@nextui-org/avatar";
import {useLoginActivity} from "@/services/queries";
import {LoginActivity} from "@/types/routes/default/types";
import Loading from "@/components/spinner/Loading";
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import {ActionButtons} from "@/components/actions/ActionButton";
import {getRandomInt} from "@/lib/utils/numberFormat";
import {Chip} from "@nextui-org/chip";
import QuestionnairesForm from "@/components/admin/defaults/security/QuestionnairesForm";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";
import {LuLogOut, LuTrash2} from "react-icons/lu";
import {icon_size_sm} from "@/lib/utils";

const twoFA = [{uid: 'off', name: 'Off'}, {uid: 'email', name: 'Email'}, {
    uid: 'app', name: 'App'
}, {uid: 'push_notification', name: 'Push Notification'}];


// Function to format a number into the format "123 456 7890"
function formatNumber(number: number): string {
    const str = String(number);
    return `${str.slice(0, 3)} ${str.slice(3, 6)} ${str.slice(6)}`;
}


const ColumnOne: React.FC = () => {
    const [codes, setCodes] = useState<string[]>()
    const [twoFASelection, setTwoFASelection] = useState<string>("");
    const [isOn, setIsOn] = useState(false)
    const [loading, setLoading] = useState(false)

    const {toast} = useToast()

    const generatedCode = useCallback(() => {
        Array.from({length: 3}, () => {
            const codes = [getRandomInt(1000000000, 9999999999), getRandomInt(1000000000, 9999999999), getRandomInt(1000000000, 9999999999)];
            const formattedCodes = codes.map(code => formatNumber(code));
            setCodes(formattedCodes)
        });

    }, [])

    const isNotAllowed = !isOn ? 'opacity-75 cursor-not-allowed' : ''

    const handleTwoFASelection = (key: SharedSelection) => {
        setTwoFASelection(key.currentKey!)
    }
    const handleOnSave = useCallback(async () => {
        setLoading(true)
        const values = {
            isOn, twoFASelection, codes
        }
        try {
            const res = await axiosInstance.put('/api/admin/security/configurations', values)
            if (res.status === 200) {
                console.log(res.data)
                toast({
                    title: 'Success', description: 'Successfully applied changes', duration: 3000, variant: 'success',
                })
            }
        } catch (error: any) {
            toast({
                title: 'Error', description: error.message, duration: 3000, variant: 'danger'
            })
            console.log(error)
        }

        setLoading(false)

    }, [isOn, twoFASelection, codes, toast])

    return (<div className='pl-4 space-y-4'>
        <Section title="Security Options" subtitle="Manage your account's security settings">
            <Switch isSelected={isOn} onValueChange={setIsOn} size='sm' color="primary"/>
        </Section>

        <div className='ms-5 space-y-5'>
            <Section title='Two-Factor Authentication'
                     subtitle="Enable two-factor authentication to secure your account."
                     className={isNotAllowed}
            >
                <SelectionMenu isDisabled={!isOn} placeholder='Email' options={twoFA}
                               onSelectionChange={handleTwoFASelection}
                               isRequired={false}/>

            </Section>
            <Section title='Recovery Codes'
                     className={isNotAllowed}
                     subtitle='Generate and save backup codes to use if the primary 2FA method is unavailable.'>
                <Button size='sm' variant='faded' isDisabled={!isOn} onClick={generatedCode}>Generate</Button>
            </Section>
            <div className={cn('ms-10 space-x-2', !isOn ? 'hidden' : '')}>
                {codes && codes.map((code, index) => (<Chip key={index}>{code}</Chip>))}
            </div>
            <div className={cn('space-y-2', isNotAllowed)}>
                <Section title='Security Questions'
                         className={isNotAllowed}
                         subtitle='Setup security questions to verify identity during account recovery.'>
                    <QuestionnairesForm isDisabled={!isOn}/>
                    {/*<Button size='sm' variant='faded' isDisabled={!isOn}>Add Question</Button>*/}
                </Section>
                <Button className='ms-10' size='sm' variant='faded' isDisabled={!isOn}>View Q&A</Button>
            </div>

        </div>
        <ActionButtons label='Apply' onSave={handleOnSave} isLoading={loading}/>
    </div>)
};

const ColumnTwo: React.FC = () => {
    const {data, isLoading} = useLoginActivity();
    const {toast} = useToast()
    const [items, setItems] = useState<Record<string, LoginActivity[]>>({});

    useEffect(() => {
        if (data) {
            // Group items by date
            const groupedItems = data.reduce((acc, activity: LoginActivity) => {
                if (!acc[activity.date]) {
                    acc[activity.date] = [];
                }
                acc[activity.date].push(activity);
                return acc;
            }, {} as Record<string, LoginActivity[]>);

            setItems(groupedItems);
        }
    }, [data]);


    // const handleOnSave = useCallback(() => {
    //     // Handle save logic
    //     const values = {
    //         isOn: isOn,
    //         twoFASelection,
    //
    //     }
    //
    // }, [])
// Flatten grouped items before rendering
    const flattenedItems = useMemo(() => {
        return Object.values(items).flat();
    }, [items]);

    const LoginActivity = useMemo(() => {
        const handleDelete = async (key: string) => {
            const values = {
                type: 'delete',
                key
            }
            try{
                const res = await axiosInstance.post('/api/admin/security/login-activity', values)
                if (res.status === 200) {
                    toast({
                        title: 'Success', description: 'Successfully deleted login activity', duration: 3000, variant: 'success',
                    })
                    //TODO: apply logic to revalidate the list

                }
            }catch (e) {
                toast({
                    title: 'Error', description: 'Failed to delete login activity', duration: 3000, variant: 'danger'
                })
                console.error(e)
            }
        }
        const handleSignOut = async (key: string) => {

            const values = {
                type: 'sign out',
                key
            }
            try{
                const res = await axiosInstance.post('/api/admin/security/login-activity', values)
                if (res.status === 200) {
                    toast({
                        title: 'Success', description: 'Successfully signed out', duration: 3000, variant: 'success',
                    })
                    //TODO: apply logic after signing out

                }
            }catch (e) {
                toast({
                    title: 'Error', description: 'Failed to signed out', duration: 3000, variant: 'danger'
                })
                console.error(e)
            }
        }
        return (<Listbox
            classNames={{
                list: "max-h-[300px] gap-2",
            }}
            emptyContent={<Typography className="text-default-400">No login activity</Typography>}
            items={flattenedItems}
            label="Assigned to"
            variant="flat"
        >
            {(item) => (<ListboxItem key={item.key} textValue={item.key}
                                     className='border border-default-200 rounded cursor-default data-[hover=true]:bg-transparent'>
                <div className='flex justify-between items-center'>
                    <div className="flex gap-2 items-center">
                        <Avatar alt={item.device_name} className="flex-shrink-0" size="sm" src={item.device_icon}/>
                        <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col">
                                <Typography
                                    className="text-medium font-semibold">Was logged in
                                    on {item.device_name + " (" + item.platform + ")"}</Typography>
                                <Typography
                                    className="text-tiny text-default-400">{(item.access_method + " on " + item.date + " at " + item.time)}</Typography>
                            </div>

                        </div>
                    </div>
                    <div className='flex gap-2'>
                        <Tooltip content='Sign out on this device'>
                            <Button size='sm' variant='light' isIconOnly onClick={handleSignOut.bind(null, item.key)}>
                                <LuLogOut className={cn("text-default-400", icon_size_sm)}/>
                            </Button>
                        </Tooltip>
                        <Tooltip content='Delete' color='danger'>
                            <Button size='sm' variant='light' isIconOnly onClick={handleDelete.bind(null, item.key)}>
                                <LuTrash2 className={cn("text-danger-400", icon_size_sm)}/>
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </ListboxItem>)}
        </Listbox>);
    }, [flattenedItems, toast]);

    return (<div className='space-y-4 pr-4'>
        <Section title='Login Activity'
                 subtitle='Shows recent login attempts and account access activities.'/>
        <div className='ms-16 space-y-5 h-[450px] overflow-hidden'>
            <ScrollShadow className="h-full pr-4" size={10}>
                {isLoading ? (<Loading/>) : (LoginActivity)}
            </ScrollShadow>
        </div>
        {/*<ActionButtons label='Apply' onSave={handleOnSave}/>*/}
    </div>)
};

function Page() {
    return (<section className='h-full flex flex-col gap-4'>
        <Heading as='h1' className='text-3xl font-bold'>Security</Heading>
        <div className='grid grid-cols-2 gap-4 w-full h-4/5'>
            <ColumnOne/>
            <ColumnTwo/>
        </div>
    </section>);
}

export default Page;
