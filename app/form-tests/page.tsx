'use client';

import React from 'react';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Form} from '@/components/ui/form';
import FormFields from '@/components/common/forms/FormFields';
import {Button} from '@nextui-org/button';
import {getLocalTimeZone, today} from "@internationalized/date";

// Define the Zod schema
const schema = z.object({
    assign: z.string(),
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
    event_time: z.date(),
    comment: z.string()
    // Ensure groupCheckbox is defined as an array of strings
});

function Page() {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema), defaultValues: {
            assign: "",
            isActive: false,
            groupCheckbox: [],
            first_name: "",
            birth_date: undefined,
            birth_date_picker: undefined,
            holiday: {start: undefined, end: undefined},
            price: "",
            list: "",
            isAirplaneMode: false,
            event_time: undefined,
            comment: "", // Initialize as an empty array
        }
    });


    const onSubmit = (values: z.infer<typeof schema>) => {
        console.log("Values: ", values);
    };

    const handleClear = () => {
        form.reset({
            assign: "",
            isActive: false,
            groupCheckbox: [],
            first_name: "",
            birth_date: undefined,
            birth_date_picker: undefined,
            holiday: {start: undefined, end: undefined},
            price: "",
            list: "",
            isAirplaneMode: false,
            event_time: undefined,
            comment: "",
        })
    }

    const handlePopulate = () => {
        form.reset({
            assign: "john",
            isActive: true,
            groupCheckbox: ["option1"],
            first_name: "John",
            birth_date: new Date(),
            birth_date_picker: new Date(),
            holiday: {start: new Date(), end: new Date()},
            price: "option3",
            list: "option2",
            isAirplaneMode: true,
            event_time: new Date(),
            comment: "Test comment",
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
                        name: "assign", label: "Assign to", type: "auto-complete", isRequired: true, config: {
                            options: [{label: "John", value: "john"}, {label: "Jane", value: "jane"}]
                        }

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
                            hideTimeZone: true
                        }
                    }, {
                        isRequired: true, name: "birth_date_picker", type: "date-picker", label: "Birth Date Picker", config: {
                            granularity: "hour",
                            hideTimeZone: true
                        }

                    }, {
                        isRequired: true, name: "holiday", type: "date-range-picker", label: "Holiday",
                        config: {
                            granularity: "hour",
                            minValue: today(getLocalTimeZone())
                        }
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
                        name: "isAirplaneMode", type: "switch", label: (<div className="flex flex-col gap-1">
                            <p className="text-medium">Enable early access</p>
                            <p className="text-tiny text-default-400">
                                Get access to new features before they are released.
                            </p>
                        </div>)
                    }, {
                        name: "event_time", type: "time-input", label: "Event Time", config: {
                            hideTimeZone: true
                        }
                    }, {
                        name: "comment", type: "text-area", label: "Comment",
                    }]}
                />
            </div>

            <div className="flex gap-4">
                <Button type="submit">Submit</Button>
                <Button onPress={handleClear}>Clear</Button>
                <Button onPress={handlePopulate}>Populate</Button>
            </div>

        </form>
    </Form>);
}

export default Page;
