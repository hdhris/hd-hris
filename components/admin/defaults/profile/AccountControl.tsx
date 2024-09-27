'use client'
import React, {useEffect, useState} from 'react';
import {useRouter} from "next/navigation";
import {SubmitHandler, useForm, useFormState} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {signOut} from "next-auth/react";
import {deleteCookie} from "cookies-next";
import axios from "axios";
import {Button, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure} from "@nextui-org/react";
import Typography, {Section} from "@/components/common/typography/Typography";
import {Form} from "@/components/ui/form";
import FormFields from "@/components/common/forms/FormFields";
import {axiosInstance} from "@/services/fetcher";
import {toast} from "@/components/ui/use-toast";
import {PasswordValidation} from "@/helper/zodValidation/PasswordValidation";

type FormValues = z.infer<typeof PasswordValidation>;

interface AccountModalProps {
    title: string;
    subtitle: string;
    onConfirm: SubmitHandler<FormValues>;
    confirmButtonText: string;
    confirmButtonColor?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    confirmButtonLoading?: boolean;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    buttonLabel: string;
    content: string;
    onOpenChange?: (open: boolean) => void;
    form: ReturnType<typeof useForm<FormValues>>;
}

const AccountModal: React.FC<AccountModalProps> = ({
                                                       title,
                                                       subtitle,
                                                       onConfirm,
                                                       confirmButtonText,
                                                       confirmButtonColor = "danger",
                                                       confirmButtonLoading = false,
                                                       isOpen,
                                                       onOpen,
                                                       onClose,
                                                       form,
                                                       buttonLabel,
                                                       content,
                                                       onOpenChange
                                                   }) => {
    const {isDirty, isValid} = useFormState(form);
    const handleOnClose = React.useCallback(() => {
        form.reset();
        onClose();
    }, [form, onClose])
    return (<>
        <Section title={title} subtitle={subtitle}>
            <Button size="sm" color={confirmButtonColor} onPress={onOpen}>
                {buttonLabel}
            </Button>
        </Section>
        <Modal
            backdrop="blur"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="top-center"
            isDismissable={false}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
                <ModalBody>
                    <Typography>{content}</Typography>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onConfirm)} className="space-y-4 mb-6">
                            <FormFields
                                items={[{
                                    name: "password",
                                    label: "Password",
                                    type: "password",
                                    placeholder: "Enter your password",
                                },]}
                            />
                            <div className="flex gap-4 justify-end">
                                <Button variant="flat" size="sm" radius="sm" onPress={handleOnClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    color='danger'
                                    size="sm"
                                    radius="sm"
                                    isLoading={confirmButtonLoading}
                                    isDisabled={!isDirty || !isValid}
                                >
                                    {confirmButtonText}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>);
};

const DeactivateAccount: React.FC = () => {
    const router = useRouter();
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const [loading, setLoading] = useState(false)
    const form = useForm<FormValues>({
        resolver: zodResolver(PasswordValidation),
    });



    const onDeactivate: SubmitHandler<FormValues> = async (values) => {
        console.log(values)
        setLoading(true);
        const controller = new AbortController();

        try {
            const response = await axiosInstance.post('/api/admin/deactivate-account', values, {
                 signal: controller.signal,
            });

            if (response.status === 200) {
                toast({
                    title: "Success", description: response.data.message, variant: 'success',
                });

                await signOut({redirect: false});
                deleteCookie('next-auth.user-session-token');
                deleteCookie('next-auth.csrf-token');
                router.push('/');
                router.refresh();
            }
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
                toast({
                    title: 'Request Timeout',
                    description: 'The request took too long and was aborted.',
                    variant: 'danger',
                });
            } else {
                toast({
                    title: 'Error', description: error.response?.data.message || 'An error occurred', variant: 'danger',
                });
                console.error("Error submitting form:", error);
            }
        }

        setLoading(false);
    };

    return (<AccountModal
        onOpenChange={onOpenChange}
        title="Deactivate Account"
        subtitle='Temporarily disable your account.'
        content="Deactivating your account will temporarily disable access to your data and services. You can reactivate your account at any time by logging in again."
        onConfirm={onDeactivate}
        buttonLabel='Deactivate Account'
        confirmButtonText="Yes, deactivate my account"
        confirmButtonColor='default'
        confirmButtonLoading={loading}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        form={form}
    />);
};

const DeleteAccount: React.FC = () => {
    const router = useRouter();
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const [loading, setLoading] = React.useState(false);
    const form = useForm<FormValues>({
        resolver: zodResolver(PasswordValidation),
    });

    const onDelete: SubmitHandler<FormValues> = async (values) => {
        setLoading(true);
        const controller = new AbortController();

        try {
            const response = await axiosInstance.delete('/api/admin/delete-account', {
                data: values, signal: controller.signal,
            });

            if (response.status === 200) {
                toast({
                    title: "Success", description: response.data.message, variant: 'success',
                });

                await signOut({redirect: false});
                deleteCookie('next-auth.user-session-token');
                deleteCookie('next-auth.csrf-token');
                router.push('/');
                router.refresh();
            }
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
                toast({
                    title: 'Request Timeout',
                    description: 'The request took too long and was aborted.',
                    variant: 'danger',
                });
            } else {
                toast({
                    title: 'Error', description: error.response?.data.message || 'An error occurred', variant: 'danger',
                });
                console.error("Error submitting form:", error);
            }
        }

        setLoading(false);
    };

    return (<AccountModal
        onOpenChange={onOpenChange}
        title="Delete Account"
        subtitle='Permanently delete your account.'
        content="Deleting your account will permanently remove all your data, including all resources. This action cannot be undone."
        onConfirm={onDelete}
        buttonLabel='Delete Account'
        confirmButtonText="Yes, delete my account"
        confirmButtonLoading={loading}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        form={form}
    />);
};

const AccountControl: React.FC = () => {
    return (<>
        <Section title="Account Control" subtitle="Manage account deactivation or deletion."/>
        <div className="ms-5 space-y-5">
            <DeactivateAccount/>
            <DeleteAccount/>
        </div>
    </>);
};

export default AccountControl;
