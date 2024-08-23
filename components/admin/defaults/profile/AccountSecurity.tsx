'use client'
import React, {useState} from 'react';
import {Section} from "@/components/common/typography/Typography";
import {Form} from "@/components/ui/form";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import ForgotButton from "@/components/forgot/ForgotButton";
import {Button} from "@nextui-org/button";
import {Spinner} from "@nextui-org/react";
import {Divider} from "@nextui-org/divider";
import {useForm, useFormState} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {RiEyeCloseLine, RiEyeLine} from "react-icons/ri";
import {icon_color} from "@/lib/utils";


const formSchema = z.object({
    new_password: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }), confirm_password: z.string().min(4, {
        message: "Password must be at least 4 characters.",
    })
}).refine(data => data.new_password === data.confirm_password, {
    message: "Passwords do not match", path: ["confirm_password"],
});
function AccountSecurity() {
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

    const currentPassword: FormInputProps[] = [
        {
            name: "current_password", label: "Current Password",   type: isVisible ? "text" : "password",  endContent: (<Button key='current_password' variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                                                                                                                                onClick={handlePasswordVisibility}>
                {isVisible ? <RiEyeLine className={icon_color}/> : <RiEyeCloseLine className={icon_color}/>}
            </Button>)
        }]
    const changePassword: FormInputProps[] = [
        {
            name: "new_password", label: "New Password",   type: isVisible ? "text" : "password", endContent: (<Button key='new_password' variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                                                                                                                       onClick={handlePasswordVisibility}>
                {isVisible ? <RiEyeLine className={icon_color}/> : <RiEyeCloseLine className={icon_color}/>}
            </Button>)
        }, {
            name: "confirm_password",
            label: "Confirm Password",
            type: isVisible ? "text" : "password",

            endContent: (<Button key='confirm_password' variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                                 onClick={handlePasswordVisibility}>
                {isVisible ? <RiEyeLine className={icon_color}/> : <RiEyeCloseLine className={icon_color}/>}
            </Button>)
        }]


    async function onSubmit(values: z.infer<typeof formSchema>) {
    }
    return (<>
            <Section title='Account Security' subtitle='Protect your account by updating your password.'/>
            {/*<div className='ms-5 space-y-5'>*/}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='ms-16 space-y-5 flex flex-col p-2'>
                    <FormFields items={currentPassword}/>
                    <div className='grid grid-cols-2 gap-4'>
                        <FormFields items={changePassword}/>
                    </div>
                    <div className='self-end !mt-2'>
                        <ForgotButton/>
                    </div>
                    <div className='self-end'>
                        <Button type='submit' size='sm' isDisabled={!isDirty || !isValid} className='w-full'
                                color='primary'
                                radius='sm'>
                            {loading ? <Spinner size="sm"/> : "Confirm"}
                        </Button>
                    </div>

                </form>
            </Form>
            {/*</div>*/}
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
        </>);
}

export default AccountSecurity;