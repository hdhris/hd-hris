"use client"
import React, {useState} from 'react';
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
import {Spinner} from "@nextui-org/react";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import forgot_hero from '@/assets/hero/forgot_hero.svg'
import Link from "next/link";
import {LuMail, LuXCircle} from "react-icons/lu";
import {Mail} from "@nextui-org/shared-icons";

function Forgot() {

    const formSchema = z.object({
        email: z.string().email({message: "Please enter a valid email address."})
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), defaultValues: {
            email: ""
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
        name: "email", label: "Email", isFocus: true, startContent: <LuMail className={'text-default-400'}/>
    }]

    async function onSubmit(values: z.infer<typeof formSchema>) {
    }

    return (<section className='h-full flex items-center justify-center gap-10 background'>
            <Card className='p-4 ' shadow='sm' radius='sm'>
                <CardHeader className='grid place-items-center gap-2'>
                    <Image src={logo} className="w-24 h-24 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500 object-contain"
                           alt="WageWise Logo"/>
                    <Typography className='font-semibold text-xl'>Unlock Your Access with Ease</Typography>
                    <Typography className='text-center'>Don&apos;t Let a Forgotten Password Hold You Back</Typography>
                </CardHeader>
                <CardBody>
                    {error && <Chip classNames={{
                        base: 'p-5 max-w-full'
                    }} variant='flat' startContent={<LuXCircle/>} color='danger' radius="sm">{error}</Chip>}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 flex flex-col p-2'>
                            <FormFields items={loginFields}/>
                            <Button type='submit' isDisabled={!isDirty || !isValid} className='w-full' color='primary'
                                    radius='sm' as={Link} href="/forgot/otp">
                                {loading ? <Spinner size="sm"/> : "Send"}

                            </Button>
                        </form>
                    </Form>
                </CardBody>
            </Card>
            <div>
                <Image src={forgot_hero} alt="logo" className='w-[500px]  h-1/4'/>
            </div>
        </section>);
}

export default Forgot;