"use client";
import React, {useEffect, useState} from 'react';
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";
import {Form} from "@/components/ui/form";
import {useForm, useFormState} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {LoginValidation} from "@/helper/zodValidation/LoginValidation";
import {login} from "@/actions/authActions";
import {Chip} from "@nextui-org/chip";
import {LuXCircle} from "react-icons/lu";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {Button} from "@nextui-org/button";
import {FaLock, FaUser} from "react-icons/fa";
import {icon_color} from "@/lib/utils";
import {RiEyeCloseLine, RiEyeLine} from "react-icons/ri";
import {useSession} from "next-auth/react";
import Typography from "@/components/common/typography/Typography";

function Authorization() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const data = useSession()
    const handlePasswordVisibility = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsVisible(!isVisible);
    }

    useEffect(() => {
        const handleOnOpenChange = async () => {
            const employee_id = data.data?.user.employee_id
            if (!employee_id) {
                onOpen();
            }
        }
        handleOnOpenChange()
    }, [data.data?.user.employee_id, onOpen]);

    const credential = useForm<z.infer<typeof LoginValidation>>({
        resolver: zodResolver(LoginValidation), defaultValues: {
            username: "", password: ""
        },
    })

    const {isDirty, isValid} = useFormState(credential)

    async function onSubmit(values: z.infer<typeof LoginValidation>) {
        setError("");
        setLoading(true);
        try {
            const loginResponse = await login(values);
        } catch (error) {
            console.log(error)
            setError("Error signing in. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const credentialFields: FormInputProps[] = [{
        name: "username", label: "Username", isFocus: true, startContent: <FaUser className={icon_color}/>
    }, {
        name: "password",
        label: "Password",
        type: isVisible ? "text" : "password",
        startContent: <FaLock className={icon_color}/>,
        endContent: (<Button variant="light" radius='sm' isIconOnly className='h-fit w-fit p-2'
                             onClick={handlePasswordVisibility}>
            {isVisible ? <RiEyeLine className={icon_color}/> : <RiEyeCloseLine className={icon_color}/> }
        </Button>)
    }]

    return (
        <Modal
            backdrop="blur"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isDismissable={false}
            hideCloseButton={true}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Change your credential</ModalHeader>
                        <ModalBody>
                            {/* Description */}
                            <Typography className="text-medium font-semibold text-center text-gray-600 mb-4">
                                Your credentials are required to be updated. Please enter your username and a new password to continue using the system.
                            </Typography>
                            <section className='h-full flex items-center justify-center gap-10 w-full'>
                                {error && (
                                    <Chip classNames={{base: 'p-5 max-w-full'}}
                                          variant='flat'
                                          startContent={<LuXCircle />}
                                          color='danger'
                                          radius="sm">
                                        {error}
                                    </Chip>
                                )}
                                <Form {...credential}>
                                    <form onSubmit={credential.handleSubmit(onSubmit)}
                                          className='space-y-5 flex flex-col p-2 w-full'>
                                        <FormFields items={credentialFields} />
                                        <Button type='submit'
                                                isDisabled={!isDirty || !isValid}
                                                className='w-full'
                                                color='primary'
                                                radius='sm'
                                                isLoading={loading}>
                                            Change
                                        </Button>
                                    </form>
                                </Form>
                            </section>
                        </ModalBody>
                        <ModalFooter />
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default Authorization;
