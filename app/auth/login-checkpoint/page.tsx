'use client'
import React, {useState} from 'react';
import {Card, CardFooter} from '@nextui-org/react';
import {CardBody, CardHeader} from "@nextui-org/card";
import Typography from "@/components/common/typography/Typography";
import {Chip} from "@nextui-org/chip";
import {Form} from "@/components/ui/form";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {Button} from "@nextui-org/button";
import {RiEyeCloseLine, RiEyeLine} from "react-icons/ri";
import {icon_color} from "@/lib/utils";
import {useForm, useFormState} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {ChangeCredentialSchema} from "@/helper/zodValidation/ChangeCredentialValidation";
import {axiosInstance} from "@/services/fetcher";
import {useRouter} from "next/navigation";
import {AxiosError} from "axios";
import {login} from "@/actions/authActions";
import {LuAlertCircle, LuCheckCircle2} from "react-icons/lu";

function Page() {
    const [isVisibleNew, setIsVisibleNew] = useState(false)
    const [isVisibleConfirm, setIsVisibleConfirm] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()


    const credential = useForm<z.infer<typeof ChangeCredentialSchema>>({
        resolver: zodResolver(ChangeCredentialSchema), defaultValues: {
            username: "", new_password: "", confirm_password: ""
        },
    })
    const {isDirty, isValid} = useFormState(credential)

    const handleNewPasswordVisibility = () => {
        setIsVisibleNew(!isVisibleNew);
    } //handlePasswordVisibility

    const handleConfirmPasswordVisibility = () => {
        setIsVisibleConfirm(!isVisibleConfirm);
    } //handlePasswordVisibility
    const changeCredentialFields: FormInputProps[] = [{
        name: "username", label: "New Username", isRequired: true
    }, {
        name: "new_password",
        label: "New Password",
        type: isVisibleNew ? "text" : "password",
        endContent: (<Button key='new_password' variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                             onPress={handleNewPasswordVisibility}>
            {isVisibleNew ? <RiEyeLine className={icon_color}/> : <RiEyeCloseLine className={icon_color}/>}
        </Button>)
    }, {
        name: "confirm_password", label: "Confirm Password", type: isVisibleConfirm ? "text" : "password",

        endContent: (<Button key='confirm_password' variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                             onPress={handleConfirmPasswordVisibility}>
            {isVisibleConfirm ? <RiEyeLine className={icon_color}/> : <RiEyeCloseLine className={icon_color}/>}
        </Button>)
    }]

    async function onSubmit(values: z.infer<typeof ChangeCredentialSchema>) {
        setError("");
        setLoading(true);
        try {
            const res = await axiosInstance.put("/api/auth/login-checkpoint", values)

            const data = {
                username: values.username, password: values.new_password
            }
            if (res.status === 200) {
                const loginResponse = await login(data);

                if (loginResponse.success) {
                    // Redirect to dashboard
                    router.push("/dashboard");

                } else if (loginResponse.error) {
                    // Display error message
                    setError(loginResponse.error.message);
                }
            } else if (res.status === 400) {
                setError(res.data.message);
            }


        } catch (error) {
            if (error instanceof AxiosError) {
                console.log("Axios Error: ", error)
                setError(error.response?.data.message);

            } else {
                setError("Error updating your account. Please try again.");
            }

            console.log("Error: ", error)

        } finally {
            setLoading(false);
        }
    }

    return (<section className='h-screen flex items-center justify-center gap-10'>
        <Card className='p-4 ' shadow='sm' radius='sm'>
            <CardHeader className='grid place-items-center gap-2'>
                <Typography className='font-semibold text-xl'>Setup Your Account</Typography>
                <Typography className='text-center'>Complete Your Account Setup: Essential Steps for a Smooth
                    Start</Typography>
            </CardHeader>
            <CardBody>
                {error && <Chip classNames={{
                    base: 'p-5 max-w-full'
                }} variant='flat' startContent={<LuAlertCircle/>} color='danger' radius="sm">{error}</Chip>}
                <Form {...credential}>
                    <form onSubmit={credential.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <FormFields items={changeCredentialFields}/>

                        </div>

                        <Button type="submit" color="primary" className="w-full" isDisabled={!isDirty || !isValid}
                                isLoading={loading}>
                            Update Credentials
                        </Button>
                    </form>
                </Form>
                <CardFooter className="text-sm text-muted-foreground flex items-center justify-center">
                    <LuCheckCircle2 className="w-4 h-4 mr-2"/>
                    Updating your credentials helps ensure your account security.
                </CardFooter>
            </CardBody>
        </Card>
    </section>);
}

export default Page;