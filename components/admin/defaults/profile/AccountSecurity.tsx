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
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";
import {signOut, useSession} from "next-auth/react";
import {ToastAction} from "@/components/ui/toast";


const formSchema = z.object({
    current_password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    new_password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }), confirm_password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    })
}).refine(data => data.new_password === data.confirm_password, {
    message: "Passwords do not match", path: ["confirm_password"],
});
function AccountSecurity() {
    const { toast } = useToast()

    const session = useSession()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), defaultValues: {
            new_password: "", confirm_password: ""
        },
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isVisibleCurrent, setIsVisibleCurrent] = useState(false)
    const [isVisibleNew, setIsVisibleNew] = useState(false)
    const [isVisibleConfirm, setIsVisibleConfirm] = useState(false)
    const handleCurrentPasswordVisibility = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsVisibleCurrent(!isVisibleCurrent);
    } //handlePasswordVisibility

    const handleNewPasswordVisibility = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsVisibleNew(!isVisibleNew);
    } //handlePasswordVisibility

 const handleConfirmPasswordVisibility = (e: { preventDefault: () => void }) => {
        e.preventDefault();
     setIsVisibleConfirm(!isVisibleConfirm);
    } //handlePasswordVisibility


    const currentPassword: FormInputProps[] = [
        {
            name: "current_password", label: "Current Password",   type: isVisibleCurrent ? "text" : "password",  endContent: (<Button key='current_password' variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                                                                                                                                onClick={handleCurrentPasswordVisibility}>
                {isVisibleCurrent ? <RiEyeLine className={icon_color}/> : <RiEyeCloseLine className={icon_color}/>}
            </Button>)
        }]
    const changePassword: FormInputProps[] = [
        {
            name: "new_password", label: "New Password",   type: isVisibleNew ? "text" : "password", endContent: (<Button key='new_password' variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                                                                                                                       onClick={handleNewPasswordVisibility}>
                {isVisibleNew ? <RiEyeLine className={icon_color}/> : <RiEyeCloseLine className={icon_color}/>}
            </Button>)
        }, {
            name: "confirm_password",
            label: "Confirm Password",
            type: isVisibleConfirm ? "text" : "password",

            endContent: (<Button key='confirm_password' variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                                 onClick={handleConfirmPasswordVisibility}>
                {isVisibleConfirm ? <RiEyeLine className={icon_color}/> : <RiEyeCloseLine className={icon_color}/>}
            </Button>)
        }]


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)

        try {
            const response = await axiosInstance.put('/api/admin/update-password', values, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if(response.status === 200) {
                form.reset()
                toast({
                    description: `${response.data.message} and you will be signed out in 1 minute or signed out now.`,
                    action: <ToastAction altText="Sign out" onClick={() => signOut({callbackUrl: '/'})}>Sign out</ToastAction>,
                    variant: 'success'
                })

                setTimeout(() => {
                    signOut({callbackUrl: '/'})
                }, 60000)
            } else {
                toast({
                    title: 'Error',
                    description: response.data.message,
                    variant: 'danger'
                })
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response.data.message,
                variant: 'danger'
            })
            console.error("Error submitting form:", error);
        }
        setLoading(false)
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
                        <Button type='submit'
                                isLoading={loading}
                                size='sm'
                                className='w-full'
                                color='primary'
                                radius='sm'>
                           Save
                        </Button>
                    </div>

                </form>
            </Form>
        </>);
}

export default AccountSecurity;