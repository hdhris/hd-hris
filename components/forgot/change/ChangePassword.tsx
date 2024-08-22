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
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    useDisclosure
} from "@nextui-org/react";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import new_password_hero from '@/assets/hero/new_password.svg'
import Link from "next/link";
import {LuXCircle} from "react-icons/lu";


function ChangePassword() {
    const forgot_icon = 'text-default-400'
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const formSchema = z.object({
        new_password: z.string().min(2, {
            message: "Username must be at least 2 characters.",
        }), confirm_password: z.string().min(4, {
            message: "Password must be at least 4 characters.",
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
    const {isDirty, isValid} = useFormState(form)


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

    const passwordChangeSuccessfullyModal = () => {
        return (<div>
            <Typography className='text-center'>Password Changed Successfully</Typography>
        </div>)
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        onOpen();
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
                        <Button type='submit' isDisabled={!isDirty || !isValid} className='w-full' color='primary'
                                radius='sm'>
                            {loading ? <Spinner size="sm"/> : "Confirm"}
                        </Button>
                    </form>
                </Form>
            </CardBody>
        </Card>
        <Modal
            backdrop="opaque"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <ModalContent>
                {(onClose) => (<>
                    <ModalHeader className="flex flex-col gap-1">Password Change Successfully</ModalHeader>
                    <ModalBody>
                        <Typography>Your password has been successfully updated. You can now log in using your new password.
                            If you did not initiate this change or suspect any unauthorized activity, please contact our
                            support team immediately.</Typography>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onClose}>
                            Close
                        </Button>
                        <Button color="primary" onPress={onClose} as={Link} href="/">
                            Proceed
                        </Button>
                    </ModalFooter>
                </>)}
            </ModalContent>
        </Modal>
    </section>);
}

export default ChangePassword;