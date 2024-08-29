'use client'

import React, {useCallback, useState} from 'react';
import {
    Button, cn, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, useDisclosure
} from "@nextui-org/react";
import {Form} from "@/components/ui/form";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {z} from "zod";
import {useForm, useFormState} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Section} from "@/components/common/typography/Typography";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import RenderList from "@/components/util/RenderList";
import BorderCard from "@/components/common/BorderCard";
import {LuTrash2} from "react-icons/lu";
import {axiosInstance} from "@/services/fetcher";
import {questionnairesFormSchema} from "@/helper/zodValidation/SecurityQuestions";
import {useToast} from "@/components/ui/use-toast";


type SecurityQuestionsAndAnswersForm = {
    key: number
    QA: {
        questions: string
        answers: string
    }
}


function QuestionnairesForm({isDisabled}: { isDisabled: boolean }) {
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const { toast } = useToast()
    const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestionsAndAnswersForm[]>([])
    const [actionButton, setActionButton] = useState<'Add' | 'Update'>('Add')
    const [loading, setLoading] = useState<boolean>(false)
    const [itemKey, setItemKey] = useState<number>()

    const questionnairesForm = useForm<z.infer<typeof questionnairesFormSchema>>({
        resolver: zodResolver(questionnairesFormSchema), defaultValues: {
            questions: "", answers: "",
        }
    })
    const {isDirty, isValid} = useFormState(questionnairesForm)
    const QA: FormInputProps[] = [{
        name: 'questions', label: 'Question', isRequired: true, Component: (field) => (<Textarea
            {...field}
            autoFocus={true}
            variant="bordered"
            placeholder="Enter your question"
        />)
    }, {
        name: 'answers', label: 'Answer', isRequired: true
    }]

    const handleOnClose = () => {
        questionnairesForm.reset({
            questions: "", answers: "",
        });
        setActionButton('Add')
        onClose()
    }

    const onSubmit = (values: z.infer<typeof questionnairesFormSchema>) => {
        if (actionButton === 'Add') {
            const numberedValues = {
                QA: values, key: securityQuestions.length + 1, // Add a unique number starting from 1
            };
            setSecurityQuestions([numberedValues, ...securityQuestions]);
        } else if (actionButton === 'Update') {
            const q = securityQuestions.find((item) => item.key === itemKey);
            if (q) {
                q.QA = values;
                setActionButton('Add');
            }
        }
        questionnairesForm.reset({
            questions: "", answers: "",
        });

    };


    const handleDelete = useCallback((key: number) => {
        setSecurityQuestions(securityQuestions.filter((item) => item.key !== key));
        if (securityQuestions.length === 0) {
            setActionButton('Add')
        }
    }, [securityQuestions])

    const handleEdit = useCallback((key: number) => {
        const q = securityQuestions.find((item) => item.key === key);
        if (q) {
            questionnairesForm.setValue('questions', q.QA.questions, {
                shouldDirty: true, shouldTouch: true, shouldValidate: true
            });
            questionnairesForm.setValue('answers', q.QA.answers, {
                shouldDirty: true, shouldTouch: true, shouldValidate: true
            });
            setActionButton('Update');
            setItemKey(key);
        }
    }, [questionnairesForm, securityQuestions]);

    const handleOnSave = useCallback(async () => {
        setLoading(true)
        try {
            const res = await axiosInstance.post('/api/admin/security/questionnaires', securityQuestions.map(({QA}) => QA))
            if (res.status === 200) {
                toast({
                    title: 'Success', description: res.data.message, variant: 'success'
                })
                setSecurityQuestions([])
                onClose()
            }
        } catch (error: any) {
            toast({
                title: 'Error', description: error.message, variant: 'danger'
            })
            console.error("Error submitting form:", error);
        }
        setLoading(false)

    }, [onClose, securityQuestions, toast]);

    const onClearSelection = useCallback(() => {
        questionnairesForm.reset({
            questions: "", answers: "",
        });
        setActionButton('Add')
    }, [questionnairesForm])

    return (<>
        <Button size='sm' variant='faded' onPress={onOpen} isDisabled={isDisabled}>Add Question</Button>
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="top-center"
            isDismissable={false}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">Add Question and Answer</ModalHeader>
                <ModalBody>
                    <Form {...questionnairesForm}>
                        <form onSubmit={questionnairesForm.handleSubmit(onSubmit)}
                              className='space-y-4 mb-2'>
                            <FormFields items={QA}/>
                            <div className='flex justify-end gap-4'>
                                {actionButton === "Update" &&
                                    <Button size='sm' variant='light' onClick={onClearSelection}>Clear
                                        Selection</Button>}
                                <Button type='submit' size='sm' isDisabled={!isDirty || !isValid}
                                        radius='sm'>
                                    {actionButton}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </ModalBody>
                <ModalFooter className="flex flex-col gap-2">
                    <ScrollShadow className='flex-1 w-full space-y-2'>
                        <RenderList items={securityQuestions}
                                    map={(item) => (<div className='flex gap-4 items-center w-full' key={item.key}>
                                        <div onClick={handleEdit.bind(null, item.key)} className='w-full'>
                                            <BorderCard
                                                className='h-fit w-full py-2 px-3 hover:bg-default-200 cursor-pointer transition-all duration-300'>
                                                <Section className='ms-0'
                                                         title={item.QA.questions}
                                                         subtitle={item.QA.answers}/>
                                            </BorderCard>
                                        </div>
                                        <LuTrash2 className={cn("cursor-pointer size-7 text-danger")}
                                                  onClick={handleDelete.bind(null, item.key)}/>
                                    </div>)}
                        />
                    </ScrollShadow>
                    <div className='flex gap-2 justify-end mt-2'>
                        <Button size='sm' radius='sm' variant='light' onPress={handleOnClose}>Cancel</Button>
                        <Button size='sm' radius='sm' color='primary' isLoading={loading} isDisabled={securityQuestions.length === 0}
                                onClick={handleOnSave}>Apply</Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>);
}

export default QuestionnairesForm;
