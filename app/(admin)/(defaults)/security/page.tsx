'use client'
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Typography, {Heading, Section} from "@/components/common/typography/Typography";
import {Button} from "@nextui-org/button";
import {Divider} from "@nextui-org/divider";
import {Listbox, ListboxItem, Spinner, Switch} from '@nextui-org/react';
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {Avatar} from "@nextui-org/avatar";
import {useLoginActivity} from "@/services/queries";
import {LoginActivity} from "@/types/routes/default/types";
import Loading from "@/components/spinner/Loading";
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {Form} from "@/components/ui/form";
import {ActionButtons} from "@/components/actions/ActionButton";
import ForgotButton from "@/components/forgot/ForgotButton";
import {recoveryFormSchema} from "@/helper/zodValidation/EmailValidation";
import {axiosInstance} from "@/services/fetcher";
import {getRandomInt} from "@/lib/utils/numberFormat";
import RenderList from "@/components/util/RenderList";
import {Chip} from "@nextui-org/chip";

const twoFA = [{uid: 'off', name: 'Off'}, {uid: 'email', name: 'Email'}, {uid: 'sms', name: 'SMS'}];


// Function to format a number into the format "123 456 7890"
function formatNumber(number: number): string {
    const str = String(number);
    return `${str.slice(0, 3)} ${str.slice(3, 6)} ${str.slice(6)}`;
}


const ColumnOne: React.FC = () => {
    const [codes, setCodes] = useState<string[]>()
    const emailForm: FormInputProps[] = [{
        label: 'Recovery Email',
        name: 'email',
        description: 'Enter an alternative email address for recovery purposes.'
    },]

    const recoveryForm = useForm<z.infer<typeof recoveryFormSchema>>({
        resolver: zodResolver(recoveryFormSchema)
    })

    async function onSubmit(values: z.infer<typeof recoveryFormSchema>) {
        try {
            const res = await axiosInstance.post('/api/admin/recovery-email', values, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            alert(res.data.message)

        } catch (error: any) {
            alert(error.message)
        }
    }


    const generatedCode = useCallback(() => {

        Array.from({length: 3}, () => {
            const codes = [
                getRandomInt(1000000000, 9999999999),
                getRandomInt(1000000000, 9999999999),
                getRandomInt(1000000000, 9999999999)
            ];
            const formattedCodes = codes.map(code => formatNumber(code));
            setCodes(formattedCodes)
        });

    }, [])

    useEffect(() => {
        generatedCode()
    }, [generatedCode]);

    return (<div className='pl-4 space-y-4'>
        <Section title="Security Options" subtitle="Manage your account's security settings"/>
        <div className='ms-5 space-y-5'>
            <Section title='Two-Factor Authentication'
                     subtitle="Enable two-factor authentication to secure your account.">
                <SelectionMenu label='Email' options={twoFA} isRequired={false}/>
            </Section>
            <Section title='Recovery Codes'
                     subtitle='Generate and save backup codes to use if the primary 2FA method is unavailable.'>
                <Button size='sm' variant='faded' onClick={generatedCode}>Generate</Button>
            </Section>
            <div className='ms-10 space-x-2'>
                {codes && codes.map((code, index) => (
                    <Chip key={index}>{code}</Chip>
                ))}
            </div>
            <div className='space-y-2'>
                <Section title='Security Questions'
                         subtitle='Setup security questions to verify identity during account recovery.'>
                    <Button size='sm' variant='faded'>Add Question</Button>
                </Section>
                <Button className='ms-10' size='sm' variant='faded'>View Q&A</Button>
            </div>
            <Form {...recoveryForm}>
                <form onSubmit={recoveryForm.handleSubmit(onSubmit)} className='ms-8 space-y-5 flex flex-col p-2'>
                    <FormFields items={emailForm}/>
                    <div className='self-end'>
                        <Button type='submit'
                                spinner={<Spinner size='sm'/>}
                            // isLoading={loading}
                                size='sm'
                                className='w-full'
                                color='primary'
                                radius='sm'>
                            Save
                        </Button>
                    </div>

                </form>
            </Form>

        </div>
    </div>)
};

const ColumnTwo: React.FC = () => {
    const {data, isLoading} = useLoginActivity();
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

// Flatten grouped items before rendering
    const flattenedItems = useMemo(() => {
        return Object.values(items).flat();
    }, [items]);

    const LoginActivity = useMemo(() => {
        return (<Listbox
            classNames={{
                list: "max-h-[300px] gap-2",
            }}
            emptyContent={<Typography className="text-default-400">No login activity</Typography>}
            items={flattenedItems}
            label="Assigned to"
            variant="flat"
        >
            {(item) => (<ListboxItem key={item.key} textValue={item.key} className='border border-default-200 rounded'>
                <div className="flex gap-2 items-center">
                    <Avatar alt={item.device_name} className="flex-shrink-0" size="sm" src={item.device_icon}/>
                    <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col">
                            <Typography
                                className="text-medium font-semibold">Was logged in
                                on{item.device_name + " (" + item.platform + ")"}</Typography>
                            <Typography
                                className="text-tiny text-default-400">{(item.access_method + " on " + item.date + " at " + item.time)}</Typography>
                        </div>
                        {/*<Typography*/}
                        {/*    className="text-default-400">₱<CountUp start={0} end={item.amount as number}*/}
                        {/*                                           formattingFn={(val) => compactNumber(val)}/></Typography>*/}
                    </div>
                </div>
            </ListboxItem>)}
        </Listbox>);
    }, [flattenedItems]);

    return (<div className='space-y-4 pr-4'>
        <Section title='Login Activity'
                 subtitle='Shows recent login attempts and account access activities.'/>
        <div className='ms-16 space-y-5 h-[450px] overflow-hidden'>
            <ScrollShadow className="h-full pr-4" size={10}>
                {isLoading ? (<Loading/>) : (LoginActivity)}
            </ScrollShadow>
        </div>
        <ActionButtons label='Apply'/>
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
