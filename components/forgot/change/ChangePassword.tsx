"use client"
import React, {useState} from 'react';
import Typography from "@/components/common/typography/Typography";
import Image from "next/image";
import logo from "@/public/logo.svg";
import {z} from "zod";
import {useForm, useFormState} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FaLock} from "react-icons/fa";
import {RiEyeCloseLine, RiEyeLine} from "react-icons/ri";
import {Form} from "@/components/ui/form";
import {Button, Card, CardBody, CardHeader, Chip} from "@nextui-org/react";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import new_password_hero from '@/assets/hero/new_password.svg'
import {LuXCircle} from "react-icons/lu";
import {axiosInstance} from "@/services/fetcher";
import SimpleAES from "@/lib/cryptography/3des";
import {deleteCookie, getCookie} from "cookies-next";
import {AxiosError} from "axios";
import {useRouter} from "next/navigation"


function ChangePassword() {
    const router = useRouter()
    const forgot_icon = 'text-default-400'
    const formSchema = z.object({
        new_password: z.string()
            .min(1, {message: "Password cannot be empty"}) // Ensures the field is not empty
            .min(8, {
                message: "Password is too short",
            }), confirm_password: z.string()
            .min(1, {message: "Password cannot be empty"}) // Ensures the field is not empty
            .min(8, {
                message: "Password is too short",
            })
    }).refine(data => data.new_password === data.confirm_password, {
        message: "Passwords do not match", path: ["confirm_password"],
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), defaultValues: {
            new_password: "", confirm_password: ""
        },
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const {isDirty,} = useFormState(form)


    const handlePasswordVisibility = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsVisible(!isVisible);
    } //handlePasswordVisibility
    const loginFields: FormInputProps[] = [{
        name: "new_password", label: "New Password", type: "password", startContent: <FaLock className={forgot_icon}/>
    }, {
        name: "confirm_password",
        label: "Confirm Password",
        type: isVisible ? "text" : "password",
        startContent: <FaLock className={forgot_icon}/>,
        endContent: (<Button key='confirm_password' variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                             onClick={handlePasswordVisibility}>
            {isVisible ? <RiEyeLine className={forgot_icon}/> : <RiEyeCloseLine className={forgot_icon}/>}
        </Button>)
    }]

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setError("")
        setLoading(true)
        try {
            const user = getCookie("user")
            const aes = new SimpleAES()
            const decrypt_user = await aes.decryptData(user as string)

            const user_data = JSON.parse(decrypt_user) as { email: string, id: string }
            const user_info = {
                id: user_data.id, ...values
            }
            const res = await axiosInstance.put('/api/auth/forgot/update-password', user_info)
            if (res.status === 200) {
                deleteCookie("user")
                router.replace("/auth/login")
            }
        } catch (error) {
            console.log(error)
            if (error instanceof AxiosError) {
                setError(error.response?.data.message)
            } else {
                setError("Something went wrong.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (<section className='h-full flex items-center justify-center gap-10 background'>
        <div>
            <Image src={new_password_hero} alt="logo" className='w-[500px]  h-1/4'/>
        </div>
        <Card className='p-4 ' shadow='sm' radius='sm'>
            <CardHeader className='grid place-items-center gap-2'>
                <Image src={logo} className="w-24 h-24 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
                       alt="WageWise Logo"/>
                <Typography className='font-semibold text-xl'>Reclaim Control, Reinforce Security</Typography>
                <Typography className='text-center'>Elevate Your Protection with a Fresh Password</Typography>
            </CardHeader>
            <CardBody>
                {error && <Chip classNames={{
                    base: 'p-5 max-w-full'
                }} variant='flat' startContent={<LuXCircle/>} color='danger' radius="sm">{error}</Chip>}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 flex flex-col p-2'>
                        <FormFields items={loginFields}/>
                        <Button type='submit' isLoading={loading} isDisabled={!isDirty} className='w-full'
                                color='primary'
                                radius='sm'>
                            Confirm
                        </Button>
                    </form>
                </Form>
            </CardBody>
        </Card>
    </section>);
}

export default ChangePassword;