'use client';

import React from 'react';
import {Card, CardBody, CardHeader, DatePicker} from "@nextui-org/react";
import {Form} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {LeaveRequestFormValidation} from "@/helper/zodValidation/leaves/request-form/LeaveRequestFormValidation";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import dayjs from "dayjs";
import {icon_color} from "@/lib/utils";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";

function RequestForm() {

    const form = useForm<z.infer<typeof LeaveRequestFormValidation>>({
        resolver: zodResolver(LeaveRequestFormValidation), defaultValues: {
            employee_name: "", start_date: "", end_date: "", reason: "", status: "",
        }
    });

    async function onSubmit(values: z.infer<typeof LeaveRequestFormValidation>) {
        console.log(values);
    }

    const LeaveRequestForm: FormInputProps[] = [{
        name: "start_date", label: "Start Date", isRequired: true, Component: (field) => {
            return (<div className="w-full flex flex-row gap-4">
                <DatePicker
                    isRequired={true}
                    onChange={(e) => {
                        if (e) {
                            form.setValue("start_date", dayjs(e.toString()).format("YYYY-MM-DD"));
                        }
                        field.onChange(e);
                    }}
                    name='start_date'
                    aria-label="Start Date"
                    variant="bordered"
                    radius="sm"
                    classNames={{
                        selectorIcon: icon_color,
                    }}
                    color="primary"
                    // value={birthdate}
                    // value={parseDate(dayjs(birthdate).format("YYYY-MM-DD")) as DateValue}
                    showMonthAndYearPickers
                />
            </div>);
        }
    }, {
        name: "end_date", label: "End Date", isRequired: true, Component: (field) => {
            return (<div className="w-full flex flex-row gap-4">
                <DatePicker
                    isRequired={true}
                    onChange={(e) => {
                        if (e) {
                            form.setValue("end_date", dayjs(e.toString()).format("YYYY-MM-DD"));
                        }
                        field.onChange(e);
                    }}
                    name='end_date'
                    aria-label="End Date"
                    variant="bordered"
                    radius="sm"
                    classNames={{
                        selectorIcon: icon_color,
                    }}
                    color="primary"
                    // value={birthdate}
                    // value={parseDate(dayjs(birthdate).format("YYYY-MM-DD")) as DateValue}
                    showMonthAndYearPickers
                />
            </div>);
        }
    }]

    return (<Card className="h-fit m-2">
            <CardHeader>Leave Request</CardHeader>
            <CardBody>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <EmployeeListForm/>
                            <FormFields items={LeaveRequestForm}/>
                        </div>
                    </form>
                </Form>
            </CardBody>
        </Card>);
}

export default RequestForm;
