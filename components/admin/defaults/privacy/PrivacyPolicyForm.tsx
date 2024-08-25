import React, {useState} from 'react';
import {z} from "zod";
import {useForm, useFormState} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import FormFields from "@/components/common/forms/FormFields";
import {Button} from "@nextui-org/button";
import {DatePicker, Spinner, Textarea} from "@nextui-org/react";
import {Form} from "@/components/ui/form";
import {FormInputProps} from "@/components/forms/FormFields";
import {icon_color} from "@/lib/utils";
import FileUpload from "@/components/common/forms/FileUpload";


const formSchema = z.object({
    new_password: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }), confirm_password: z.string().min(4, {
        message: "Password must be at least 4 characters.",
    })
}).refine(data => data.new_password === data.confirm_password, {
    message: "Passwords do not match", path: ["confirm_password"],
});

function PrivacyPolicyForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), defaultValues: {
            new_password: "", confirm_password: ""
        },
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const {isDirty, isValid} = useFormState(form)

    const title: FormInputProps[] = [{
        name: 'privacy_title', label: 'Title', isRequired: true
    }, {
        name: 'effective_date', label: 'Effective Date', isRequired: true, Component: (field) => {
            return (<div className="w-full flex flex-row gap-4">
                <DatePicker
                    onChange={field.onChange}
                    aria-label="Birth Date"
                    variant="bordered"
                    radius="sm"
                    classNames={{selectorIcon: icon_color}}
                    color="primary"
                    showMonthAndYearPickers
                />
            </div>)
        }
    }]

    const description: FormInputProps[] = [{
        name: 'privacy_description', label: 'Description', isRequired: true, Component: (field) => (<Textarea
            {...field}
            variant="bordered"
            placeholder="Enter your description"
        />)
    }]

    async function onSubmit(values: z.infer<typeof formSchema>) {

    }

    return (<Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 flex flex-col p-2'>
            <div className='grid grid-cols-2 gap-4'>
                <FormFields items={title}/>
            </div>
            <FormFields items={description}/>
            <div className='self-end'>
                <Button type='submit' size='sm' isDisabled={!isDirty || !isValid} className='w-full'
                        color='primary'
                        radius='sm'>
                    {loading ? <Spinner size="sm"/> : "Confirm"}
                </Button>
            </div>
        </form>
    </Form>);
}

export default PrivacyPolicyForm;