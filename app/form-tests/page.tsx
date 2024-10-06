'use client';

import React, {useEffect} from 'react';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Form} from '@/components/ui/form';
import FormFields from '@/components/common/forms/FormFields';
import {Button} from '@nextui-org/button';
import {cn} from "@nextui-org/react";
import {parseDate} from "@internationalized/date";

// Define the Zod schema
const schema = z.object({
    isActive: z.boolean(),
    first_name: z.string(),
    groupCheckbox: z.array(z.string()),
    birth_date: z.date(),
    birth_date_picker: z.date(),
    holiday: z.object({
        start: z.date(), end: z.date(),
    }).refine(data => data.start && data.end, {
        message: "Holiday start and end must be defined",
    }),
    price: z.string(),
    list: z.string(),
    isAirplaneMode: z.boolean(),
    event_time: z.string().time(),
    // Ensure groupCheckbox is defined as an array of strings
});

function Page() {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema), defaultValues: {
            isActive: false,
            groupCheckbox: [],
            first_name: "",
            birth_date: undefined,
            birth_date_picker: undefined,
            holiday: {start: undefined, end: undefined},
            price: "",
            list: "",
            isAirplaneMode: false,
            event_time: "",
            // Initialize as an empty array
        }
    });



    const onSubmit = (values: z.infer<typeof schema>) => {
        console.log("Values: ", values);
    };

    const handleClear = () => {
        form.reset({
            isActive: false,
            groupCheckbox: [],
            first_name: "",
            birth_date: undefined,
            birth_date_picker: undefined,
            holiday: {start: undefined, end: undefined},
            price: "",
            list: "",
            isAirplaneMode: false,
            event_time: "",
        })
    }

    const handlePopulate = () => {
        form.reset({
            isActive: true,
            groupCheckbox: ["option1"],
            first_name: "John",
            birth_date: new Date(),
            birth_date_picker: new Date(),
            holiday: {start: new Date(), end: new Date()},
            price: "option3",
            list: "option2",
            isAirplaneMode: true,
            event_time: "10:00:00",
        })
    }
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
                    }, {
                        isRequired: true, name: "birth_date", type: "date-input", label: "Birth date", config: {

                        }
                    }, {
                        isRequired: true, name: "birth_date_picker", type: "date-picker", label: "Birth Date Picker",
                        config: {
                            defaultValue: parseDate("2024-09-29"),
                        }
                    }, {
                        isRequired: true, name: "holiday", type: "date-range-picker", label: "Holiday",
                    }, {
                        name: "price", type: "radio-group", label: "Price", config: {

                            required: true, options: [{
                                label: "Option 1", value: "option1",
                            }, {
                                label: "Option 2", value: "option2",
                            }, {
                                label: "Option 3", value: "option3",
                            }]
                        }
                    }, {
                        name: "list", type: "select", label: "List", config: {
                            options: [{
                                label: "Option 1", value: "option1",
                            }, {
                                label: "Option 2", value: "option2",
                            }, {
                                label: "Option 3", value: "option3",
                            }]
                        }
                    }, {
                        name: "isAirplaneMode", type: "switch", label: (
                            <div className="flex flex-col gap-1">
                                <p className="text-medium">Enable early access</p>
                                <p className="text-tiny text-default-400">
                                    Get access to new features before they are released.
                                </p>
                            </div>),
                        config: {
                            classNames: {
                                base: cn(
                                    "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                                    "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                                    "data-[selected=true]:border-primary",
                                ),
                                wrapper: "p-0 h-4 overflow-visible",
                                thumb: cn("w-6 h-6 border-2 shadow-lg",
                                    "group-data-[hover=true]:border-primary",
                                    //selected
                                    "group-data-[selected=true]:ml-6",
                                    // pressed
                                    "group-data-[pressed=true]:w-7",
                                    "group-data-[selected]:group-data-[pressed]:ml-4",
                                ),
                            }
                        }
                    }, {
                        name: "event_time", type: "time-input", label: "Event Time",
                    }]}
                />
            </div>

            <Button type="submit">Submit</Button>
            <Button onClick={handleClear}>Clear</Button>
            <Button onClick={handlePopulate}>Populate</Button>
        </form>
    </Form>);
}

export default Page;
