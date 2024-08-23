'use client'
import React, {useState} from 'react';
import {Heading, Section} from "@/components/common/typography/Typography";
import {Button} from "@nextui-org/button";
import BackupFiles from "@/components/admin/defaults/backup/BackupFiles";
import {ActionButtons} from "@/components/actions/ActionButton";
import ProfileForm from "@/components/admin/defaults/profile/ProfileForm";
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import {Divider} from "@nextui-org/divider";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {Spinner} from "@nextui-org/react";
import {Form} from "@/components/ui/form";
import {z} from "zod";
import {useForm, useFormState} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FaLock} from "react-icons/fa";
import {RiEyeCloseLine, RiEyeLine} from "react-icons/ri";
import {icon_size} from "@/lib/utils";


const formSchema = z.object({
    new_password: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }), confirm_password: z.string().min(4, {
        message: "Password must be at least 4 characters.",
    })
}).refine(data => data.new_password === data.confirm_password, {
    message: "Passwords do not match", path: ["confirm_password"],
});



const AccountSettings: React.FC = () => (<div className='space-y-4 pr-4'>

    <div className='ms-5 space-y-5 h-[40%] overflow-hidden'>
        <ProfileForm/>
    </div>
    <Divider/>
    <Section title='Account Control' subtitle='Manage account deactivation or deletion.'/>
    <div className='ms-5 space-y-5'>
        <Section title='Deactivate Account' subtitle='Temporarily disable your account.'>
            <Button size='sm' variant='faded'>Deactivate</Button>
        </Section>
        <Section title='Delete Account' subtitle='Permanently remove your account.'>
            <Button size='sm' color='danger'>Delete</Button>
        </Section>
    </div>
</div>);

const AccountSecurity: React.FC = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), defaultValues: {
            new_password: "", confirm_password: ""
        },
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const {isDirty, isValid} = useFormState(form)
    const handlePasswordVisibility = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsVisible(!isVisible);
    } //handlePasswordVisibility

    const changePassword: FormInputProps[] = [
        {
            name: "current_password", label: "Current Password",   type: isVisible ? "text" : "password",  endContent: (<Button key='current_password' variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                                                                                                 onClick={handlePasswordVisibility}>
                {isVisible ? <RiEyeLine className={icon_size}/> : <RiEyeCloseLine className={icon_size}/>}
            </Button>)
        },
        {
        name: "new_password", label: "New Password",   type: isVisible ? "text" : "password", endContent: (<Button key='new_password' variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                                                                                            onClick={handlePasswordVisibility}>
                {isVisible ? <RiEyeLine className={icon_size}/> : <RiEyeCloseLine className={icon_size}/>}
            </Button>)
    }, {
        name: "confirm_password",
        label: "Confirm Password",
        type: isVisible ? "text" : "password",

        endContent: (<Button key='confirm_password' variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                             onClick={handlePasswordVisibility}>
            {isVisible ? <RiEyeLine className={icon_size}/> : <RiEyeCloseLine className={icon_size}/>}
        </Button>)
    }]


    async function onSubmit(values: z.infer<typeof formSchema>) {
    }

    return (<div className='pl-4 space-y-4'>
        <Section title='Account Security' subtitle='Protect your account by updating your password.'/>
        <div className='ms-5 space-y-5'>
            <Section title='Restore Options' subtitle='Choose from various restore options to recover your data.'/>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 flex flex-col p-2'>
                    <FormFields items={changePassword}/>
                    <Button type='submit' isDisabled={!isDirty || !isValid} className='w-full' color='primary'
                            radius='sm'>
                        {loading ? <Spinner size="sm"/> : "Confirm"}
                    </Button>
                </form>
            </Form>
        </div>
    </div>)
};

function Page() {
    return (<section className='h-full flex flex-col gap-4'>
        <Heading as='h1' className='text-3xl font-bold'>Account Settings</Heading>
        <div className='grid grid-cols-2 gap-4 w-full overflow-hidden'>
            <AccountSettings/>
            <AccountSecurity/>
        </div>
        <ActionButtons label='Apply'/>
    </section>);
}

export default Page;
