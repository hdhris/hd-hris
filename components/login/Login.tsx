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
import {Checkbox} from "@nextui-org/react";
import {icon_color} from "@/lib/utils";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {LuXCircle} from "react-icons/lu";
import ForgotButton from "@/components/forgot/ForgotButton";
import {login} from "@/actions/authActions";
import DES from "@/lib/cryptography/3des";
import Simple3Des from "@/lib/cryptography/3des";

const loginSchema = z.object({
    username: z.string().min(1, {message: "Username is required."}), password: z.string().min(1, {message: "Password is required."})
})
function Login() {

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema), defaultValues: {
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

    async function onSubmit(values: z.infer<typeof loginSchema>) {

        const des = new Simple3Des()
        // des.decryptData("7tUlw+Az1jzLbUsDU8qBQ/vheiV3o4c1")
        console.log(des.decryptData("7tUlw+Az1jzLbUsDU8qBQ/vheiV3o4c1"))
        setError("");
        setLoading(true);
        try {
            const res = await login(values);
            if(res){
                console.log(res.error)
                setError(res.error.message)
            }

        } catch (error) {
            console.log(error)
            setError("Error signing in. Please try again.");
        } finally {
            setLoading(false);
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
                }} variant='flat' startContent={<LuXCircle/>} color='danger' radius="sm">{error}</Chip>}
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