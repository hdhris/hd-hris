'use client'
import React, {useEffect, useState} from 'react';
import Typography from "@/components/common/typography/Typography";
import Image from "next/image";
import logo from "@/public/logo.svg";
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {z} from "zod";
import {useForm, useFormState} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@nextui-org/button";
import {Form} from "@/components/ui/form";
import {Chip} from "@nextui-org/chip";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import otp_hero from '@/assets/hero/otp_hero.svg'
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {REGEXP_ONLY_DIGITS} from "input-otp";
import {calculateTimeLeft} from "@/lib/utils/timeLeft";
import {LuXCircle} from "react-icons/lu";
import {deleteCookie, getCookie, setCookie} from "cookies-next";
import {useRouter} from "next/navigation";
import SimpleAES from "@/lib/cryptography/3des";
import {v4 as uuidv4} from "uuid";
import {AxiosError} from "axios";
import {axiosInstance} from "@/services/fetcher";


interface TimeLeft {
    minutes: number;
    seconds: number;
}

interface OTPProps {
    redirectOnSuccess?: string
}

function OTP({redirectOnSuccess}: OTPProps) {
    const router = useRouter()
    const otpData = JSON.parse(getCookie('otp') || '{}');
    const {value, expires} = otpData;
    const otpClassName = "w-12 h-12 text-medium font-semibold"
    const formSchema = z.object({
        otp: z.string().length(6, {message: "Please enter a valid OTP."})
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), defaultValues: {
            otp: ""
        },
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [expiryTime, setExpiryTime] = useState<Date>(new Date(new Date(expires))); // OTP expires in 2 minutes
    const {isDirty, isValid} = useFormState(form);
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(expiryTime.getTime()));

    useEffect(() => {
        const timer = setInterval(() => {
            const calculatedTimeLeft = calculateTimeLeft(expiryTime.getTime());
            if (!calculatedTimeLeft) {
                clearInterval(timer);
                // Handle OTP expiration here
                deleteCookie("otp")
                deleteCookie('otp-token')
                setError("Otp expired")
            } else {
                setTimeLeft(calculatedTimeLeft);
            }
        }, 1000);
        return () => clearInterval(timer);

    }, [expiryTime]);


    const loginFields: FormInputProps[] = [{
        Component: (field) => {
            return (<div className='w-full flex justify-center'>
                <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} {...field} autoFocus>
                    <InputOTPGroup>
                        {[...Array(6)].map((_, index) => (
                            <InputOTPSlot key={index} index={index} className={otpClassName} />))}
                    </InputOTPGroup>
                </InputOTP>
            </div>);
        }, name: 'otp', label: 'OTP', description: 'Enter OTP sent to your email'
    }];

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setError("")
        const aes = new SimpleAES()
        const isValid = await aes.compare(values.otp, String(value))

        if (!isValid) {
            setError('Invalid OTP');
        } else {
            router.replace(redirectOnSuccess || "/");
            setCookie("change-password-token", uuidv4())
            setCookie("token-creation-time", Date.now())
            deleteCookie('otp')
            deleteCookie('otp-token')
        }
    }

    const resend = async () => {
        setError("")
        setLoading(true)
        try {
            const email = getCookie("email")
            const res = await axiosInstance.post("/api/auth/forgot/authenticating-email", {email: email as string})

            setExpiryTime(new Date(Date.now() + 2 * 60 * 1000)); // OTP expires in 2 minutes}
            if (res.status === 200) {
                const token = uuidv4()
                setCookie('otp-token', token, {maxAge: 15 * 60}) // Cookie expires in 2 minutes
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

    const renderTimeLeftHTML = (timeLeft: TimeLeft) => {
        if (!timeLeft) return "0";
        const {minutes, seconds} = timeLeft;
        const timeString = `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
        return <div className='text-tiny grid place-items-center' suppressHydrationWarning={true}>OTP expires
            in {timeString}</div>;
    };


    return (<section className='h-full flex items-center justify-center gap-10 background'>
        <Card className='p-4 w-1/2' shadow='sm' radius='sm'>
            <CardHeader className='grid place-items-center gap-2'>
                <Image src={logo} className="w-24 h-24 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
                       alt="WageWise Logo"/>
                <Typography className='font-semibold text-xl'>Instant Access, Securely Restored</Typography>
                <Typography className='text-center'>Retrieve Your Account with a Single Code</Typography>
            </CardHeader>
            <CardBody>
                {error && <Chip classNames={{
                    base: 'p-5 max-w-full'
                }} variant='flat' startContent={<LuXCircle/>} color='danger' radius="sm">{error}</Chip>}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 flex flex-col p-2'>
                        <FormFields items={loginFields}/>
                        <div>{renderTimeLeftHTML(timeLeft!)}</div>
                        {timeLeft !== null && timeLeft.seconds > 0 || timeLeft && timeLeft!.minutes > 0 ?
                            <Button type='submit' isDisabled={!isDirty || !isValid} className='w-full'
                                    color='primary'
                                    radius='sm'>
                                {"Verify"}
                            </Button> : <Button isLoading={loading} onClick={resend} className='w-full' color='primary'
                                                radius='sm'>
                                {"Resend"}
                            </Button>}

                    </form>
                </Form>
            </CardBody>
        </Card>
        <div>
            <Image src={otp_hero} alt="logo" className='w-[500px]  h-1/4'/>
        </div>
    </section>);
}

export default OTP;
