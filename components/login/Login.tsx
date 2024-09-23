"use client"
import React, {Suspense, useEffect, useState} from 'react';
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
import {Checkbox, cn} from "@nextui-org/react";
import {icon_color, text_truncated} from "@/lib/utils";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {LuXCircle} from "react-icons/lu";
import ForgotButton from "@/components/forgot/ForgotButton";
import {login} from "@/actions/authActions";
import {useRouter, useSearchParams} from "next/navigation";
import {Divider} from "@nextui-org/divider";
import OAthLogin from "@/components/login/OAthLogin";
import {useSession} from "next-auth/react";

const loginSchema = z.object({
    username: z.string().min(1, {message: "Username is required."}),
    password: z.string().min(1, {message: "Password is required."})
});

function Userlogin() {
    const router = useRouter();
    const session = useSession();
    const searchParams = useSearchParams();
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema), defaultValues: {
            username: "", password: ""
        },
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const {isDirty, isValid} = useFormState(form)


    useEffect(() => {
        const errorMessages: Record<string, string> = {
            CredentialsSignin: "Invalid username or password.",
            GoogleSignin: "Google authentication failed.",
            Configuration: "Configuration error.",
            AccessDenied: "Access denied. Please contact your admin.",
            OAuthAccountNotLinked: " Another account already exists with the same e-mail address.",
            default: "An unknown error occurred. Please try again.",
        };
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(errorMessages[errorParam] || errorMessages.default);
            // alert(errorParam)
            router.push('/');
        }


    }, [router, searchParams]);

    const handlePasswordVisibility = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsVisible(!isVisible);
    }

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
    }];

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setError("");
        setLoading(true);

        try {
            const loginResponse = await login(values);

            if (loginResponse.success) {

                // Redirect to dashboard
                router.push("/dashboard");


            } else if (loginResponse.error) {
                // Display error message
                console.error(loginResponse.error);
                setError(loginResponse.error.message);
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            setError("Error signing in. Please try again.");
        } finally {
            setLoading(false);
        }
    }


    return (<section className='h-full flex items-center justify-center gap-10'>
        {/*<Image src={hero} alt="HRIS Hero" width={500} height={500}/>*/}
        <Card className='p-4 ' shadow='sm' radius='sm'>
            <CardHeader className='grid place-items-center gap-2'>
                <Image src={logo} className="w-24 h-24 p-1 rounded-full dark:ring-gray-500"
                       alt="WageWise Logo"/>
                <Typography className='font-semibold text-xl'>Secure Access Starts Here</Typography>
                <Typography className='text-center'>Login to {process.env.APP_NAME} for Effortless Payroll
                    Management</Typography>
            </CardHeader>
            <CardBody>
                {error && <Chip classNames={{
                    base: cn('p-5 max-w-1/2 self-center', text_truncated)
                }} variant='flat' startContent={<LuXCircle/>} color='danger' radius="sm">{error}</Chip>}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 flex flex-col p-2'>
                        <FormFields items={loginFields}/>
                        <div className='flex justify-between'>
                            <Checkbox size='sm'>Remember Me</Checkbox>
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
                <Divider className='my-5'/>
                <OAthLogin/>
                <ForgotButton className="text-sm self-center w-full mt-5 underline"/>
            </CardBody>
        </Card>
    </section>)
}

function Login() {
    return (<Suspense>
        <Userlogin/>
    </Suspense>)
}

export default Login;
