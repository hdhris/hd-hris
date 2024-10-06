'use client';

import React from 'react';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Form} from '@/components/ui/form';
import FormFields from '@/components/common/forms/FormFields';
import {Button} from '@nextui-org/button';

// Define the Zod schema
const schema = z.object({
    isActive: z.boolean(),
    first_name: z.string(),
    groupCheckbox: z.array(z.string()),
    birth_date: z.date(),
    birth_date_picker: z.date(),
    holiday: z.object({
        start: z.date(),
        end:  z.date(),
    }).refine(data => data.start && data.end, {
        message: "Holiday start and end must be defined",
    }),
    price: z.string()
    // Ensure groupCheckbox is defined as an array of strings
});

function Page() {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema), defaultValues: {
            isActive: false, groupCheckbox: [], // Initialize as an empty array
        }
    });

    const onSubmit = (values: z.infer<typeof schema>) => {
        alert('Values: ' + JSON.stringify(values));
    };

    return (<Form {...form}>
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid place-items-center w-full h-screen"
        >
            <div className="grid grid-cols-2 gap-4">
                <FormFields
                    items={[{
                        name: "first_name", label: "First Name", isRequired: true,

                    }, {
                        name: 'isActive', type: 'checkbox', label: 'Checkbox', config: {
                            defaultSelected: false, color: "warning",
                        },
                    }, {
                        name: "groupCheckbox", type: "group-checkbox", label: "Select Options", config: {
                            options: [{
                                label: "Option 1", value: "option1",
                            }, {
                                label: "Option 2", value: "option2",
                            }]
                        }
                    },
                        {
                        isRequired: true, name: "birth_date", type: "date-input", label: "Birth date",
                    },
                        {
                        isRequired: true, name: "birth_date_picker", type: "date-picker", label: "Birth Date Picker",
                    },
                        {
                        isRequired: true, name: "holiday", type: "date-range-picker", label: "Holiday",
                    },
                        {
                       name: "price", type: "radio-group", label: "Price", config: {
                           required: true,
                           options: [{
                               label: "Option 1", value: "option1",
                           }, {
                               label: "Option 2", value: "option2",
                           }, {
                               label: "Option 3", value: "option3",
                           }]
                        }
                    },
                        {
                            name: "carry", label:"Carry", type: "radio"
                        }

                    ]}
                />
            </div>

            <Button type="submit">Submit</Button>
        </form>
    </Form>);
}

export default Page;
