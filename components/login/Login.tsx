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
import {Checkbox, cn} from "@nextui-org/react";
import {icon_color, text_truncated} from "@/lib/utils";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {LuXCircle} from "react-icons/lu";
import ForgotButton from "@/components/forgot/ForgotButton";
import {login} from "@/actions/authActions";
import {useRouter} from "next/navigation";
import {Divider} from "@nextui-org/divider";
import GoogleLogin from "@/components/login/OAthLogin";
import OAthLogin from "@/components/login/OAthLogin";
import hero from "@/assets/icons/hris_hero.jpg";
import SimpleAES from "@/lib/cryptography/3des";

const loginSchema = z.object({
    username: z.string().min(1, {message: "Username is required."}), password: z.string().min(1, {message: "Password is required."})
})
function Login() {

    const router = useRouter()
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

        // const simple3Des = new SimpleAES(); // Initialization happens automatically
        // //
        // const plaintext = 'password';
        // console.log("Plain Text: ", plaintext)
        // const encryptedText = await simple3Des.encryptData(plaintext);
        // console.log('Encrypted:', encryptedText);
        // console.log('Length:', encryptedText.length);
        //
        // const decryptedText = await simple3Des.decryptData(encryptedText)
        // console.log("Decrypted: ", decryptedText)
        // const isMatch = await simple3Des.compare(plaintext, encryptedText);
        // console.log('Does the decrypted text match the plaintext?', isMatch);
        setError("");
        setLoading(true);
        try {
            const loginResponse = await login(values);

            if (loginResponse.success) {
                // Redirect to dashboard
                router.push("/dashboard")

            } else if (loginResponse.error) {
                // Display error message
                setError(loginResponse.error.message)
            }

        } catch (error) {
            console.log(error)
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
                    base: cn('p-5 max-w-1/2', text_truncated)
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
    </section>);
}

export default Login;