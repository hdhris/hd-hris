"use client"
import React, {useState} from 'react';
import Typography from "@/components/common/typography/Typography";
import Image from "next/image";
import logo from "@/public/logo.svg";
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {z} from "zod";
import {useForm, useFormState} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FaLock, FaUser} from "react-icons/fa";
import {RiEyeCloseLine, RiEyeLine} from "react-icons/ri";
import {Button} from "@nextui-org/button";
import {Form} from "@/components/ui/form";
import {Chip} from "@nextui-org/chip";
import {Checkbox, Spinner} from "@nextui-org/react";
// import FormFields, {FormInputProps} from "@/components/forms/FormFields";
import login_hero from '@/assets/hero/login_hero.svg'
import Link from "next/link";
import {icon_color} from "@/lib/utils";
import {signIn} from "next-auth/react";
import {LoginValidation} from "@/helper/zodValidation/LoginValidation";
import {usePathname, useRouter} from "next/navigation";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {LuXCircle} from "react-icons/lu";
import ForgotButton from "@/components/forgot/ForgotButton";

function Login() {
    const router = useRouter()

    const form = useForm<z.infer<typeof LoginValidation>>({
        resolver: zodResolver(LoginValidation), defaultValues: {
            username: "", password: ""
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
    const loginFields: FormInputProps[] = [{
        name: "username", label: "Username", isFocus: true, startContent: <FaUser className={icon_color}/>
    }, {
        name: "password",
        label: "Password",
        type: isVisible ? "text" : "password",
        startContent: <FaLock className={icon_color}/>,
        endContent: (<Button variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                             onClick={handlePasswordVisibility}>
            {isVisible ? <RiEyeLine className={icon_color}/> : <RiEyeCloseLine className={icon_color}/>}
        </Button>)
    }]

    async function onSubmit(values: z.infer<typeof LoginValidation>) {
        setError(""); // Clear any previous errors
        setLoading(true); // Set loading state to true
        try {
            const res = await signIn('credentials', {
                username: values.username,
                password: values.password,
                redirect: false
            });

            if (res) {
                if (res.ok && res.status === 200) {
                        router.push('/dashboard');

                } else if (res && res.status === 401) {
                    setError(res.error!);
                }
            } else {
                setError("Sign in failed. Please try again."); // Handle other potential errors
            }
        } catch (error) {
            setError("Error signing in. Please try again."); // Catch any unexpected errors
        } finally {
            setLoading(false); // Ensure loading
        }
    }

    return (<section className='h-full flex items-center justify-center gap-10'>
        <Card className='p-4 ' shadow='sm' radius='sm'>
            <CardHeader className='grid place-items-center gap-2'>
                <Image src={logo} className="w-24 h-24 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
                       alt="WageWise Logo"/>
                <Typography className='font-semibold text-xl'>Secure Access Starts Here</Typography>
                <Typography className='text-center'>Login to GVC-PMS for Effortless Payroll
                    Management</Typography>
            </CardHeader>
            <CardBody>
                {error && <Chip classNames={{
                    base: 'p-5 max-w-full'
                }} variant='flat' startContent={<LuXCircle />} color='danger' radius="sm">{error}</Chip>}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 flex flex-col p-2'>
                        <FormFields items={loginFields}/>
                        <div className='flex justify-between'>
                            <Checkbox size='sm'>Remember Me</Checkbox>
                            <ForgotButton/>
                        </div>

                        {/*<Typography as={Link} href={'/forgot'} className='text-red-400 cursor-pointer text-right text-small'></Typography>*/}

                        <Button type='submit' isDisabled={!isDirty || !isValid} className='w-full' color='primary'
                                radius='sm'
                                isLoading={loading}
                        >
                            Login
                        </Button>
                    </form>
                </Form>
            </CardBody>
        </Card>
    </section>);
}

export default Login;