'use client'
import React, {useState, useEffect, useMemo} from 'react';
import Typography from "@/components/common/typography/Typography";
import Image from "next/image";
import logo from "@/public/logo.svg";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { z } from "zod";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nextui-org/button";
import { Form } from "@/components/ui/form";
import { Chip } from "@nextui-org/chip";
import { Spinner } from "@nextui-org/react";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import otp_hero from '@/assets/hero/otp_hero.svg'
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { calculateTimeLeft } from "@/lib/utils/timeLeft";
import Link from "next/link";
import {LuXCircle} from "react-icons/lu";


interface TimeLeft {
    minutes: number;
    seconds: number;
}

function OTP() {
    const otpClassName = "w-12 h-12 text-medium font-semibold"
    const formSchema = z.object({
        otp: z.string().length(6, { message: "Please enter a valid OTP." })
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            otp: ""
        },
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [expiryTime, setExpiryTime] = useState<Date>(new Date(Date.now() + 2 * 60 * 1000)); // OTP expires in 5 minutes
    const { isDirty, isValid } = useFormState(form);
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(expiryTime.getTime()));

    useEffect(() => {
        const timer = setInterval(() => {
            const calculatedTimeLeft = calculateTimeLeft(expiryTime.getTime());
            if (!calculatedTimeLeft) {
                clearInterval(timer);
                // Handle OTP expiration here
                console.log("OTP expired");
            } else {
                setTimeLeft(calculatedTimeLeft);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiryTime]);

    const handlePasswordVisibility = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsVisible(!isVisible);
    };

    const loginFields: FormInputProps[] = [{
        Component: (field) => {
            return (
                <div className='w-full flex justify-center'>
                    <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} {...field}>
                        <InputOTPGroup>
                            {[...Array(6)].map((_, index) => (
                                <InputOTPSlot key={index} index={index} className={otpClassName} />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                </div>
            );
        },
        name: 'otp',
        label: 'OTP',
        description: 'Enter OTP sent to your email'
    }];

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Submit logic here
    }

    const renderTimeLeftHTML = (timeLeft: TimeLeft) => {
        if (!timeLeft) return "0";
        const { minutes, seconds } = timeLeft;
        const timeString = `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
        return <div className='text-tiny grid place-items-center'>OTP expires in {timeString}</div>;
    };


    return (
        <section className='h-full flex items-center justify-center gap-10 background'>
            <Card className='p-4 w-1/2' shadow='sm' radius='sm'>
                <CardHeader className='grid place-items-center gap-2'>
                    <Image src={logo} className="w-24 h-24 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
                           alt="WageWise Logo" />
                    <Typography className='font-semibold text-xl'>Instant Access, Securely Restored</Typography>
                    <Typography className='text-center'>Retrieve Your Account with a Single Code</Typography>
                </CardHeader>
                <CardBody>
                    {error && <Chip classNames={{
                        base: 'p-5 max-w-full'
                    }} variant='flat' startContent={<LuXCircle />} color='danger' radius="sm">{error}</Chip>}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 flex flex-col p-2'>
                            <FormFields items={loginFields}/>
                            <div suppressHydrationWarning>{renderTimeLeftHTML(timeLeft!)}</div>
                            {
                                timeLeft !== null && timeLeft.seconds > 0 || timeLeft!.minutes > 0 ?
                                    <Button type='submit' isDisabled={!isDirty || !isValid} className='w-full'
                                            color='primary'
                                            radius='sm' as={Link} href="/forgot/change">
                                        {loading ? <Spinner size="sm"/> : "Verify"}
                                    </Button> :
                                    <Button type='submit' className='w-full' color='primary'
                                            radius='sm'>
                                        {loading ? <Spinner size="sm"/> : "Resend"}
                                    </Button>
                            }

                        </form>
                    </Form>
                </CardBody>
            </Card>
            <div>
                <Image src={otp_hero} alt="logo" className='w-[500px]  h-1/4' />
            </div>
        </section>
    );
}

export default OTP;
