import Drawer from "@/components/common/Drawer";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import FormFields from "@/components/common/forms/FormFields";
import { Form } from "@/components/ui/form";
import { UserEmployee } from "@/helper/include-emp-and-reviewr/include";
import { useUserInfo } from "@/lib/utils/getEmployeInfo";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface FileOvertimeProps {
    isOpen: boolean;
    onClose: () => void;
}
function FileOvertime({ isOpen, onClose }: FileOvertimeProps) {
    const userInfo = useUserInfo();
    const { data: employees, isLoading } = useQuery<UserEmployee[]>("/api/admin/utils/get-employee-search");

    const formSchema = useMemo(() => {
        return z
            .object({
                reason: z.string({ message: "Reason is required." }),
                clock_in: z.string({ message: "Clock In time is required." }).refine((data) => {
                    return !(
                        toGMT8(data).isBefore(
                            toGMT8(toGMT8(userInfo?.dim_schedules[0].ref_batch_schedules.clock_in).format("HH:mm:ss"))
                        ) ||
                        toGMT8(data).isBefore(
                            toGMT8(toGMT8(userInfo?.dim_schedules[0].ref_batch_schedules.clock_out).format("HH:mm:ss"))
                        )
                    );
                }, "Clock-in must not preceed your time schedule"),
                clock_out: z.string({ message: "Clock Out time is required." }).refine((data) => {
                    return !(
                        toGMT8(data).isBefore(
                            toGMT8(toGMT8(userInfo?.dim_schedules[0].ref_batch_schedules.clock_in).format("HH:mm:ss"))
                        ) ||
                        toGMT8(data).isBefore(
                            toGMT8(toGMT8(userInfo?.dim_schedules[0].ref_batch_schedules.clock_out).format("HH:mm:ss"))
                        ) ||
                        toGMT8(data).isSame(
                            toGMT8(toGMT8(userInfo?.dim_schedules[0].ref_batch_schedules.clock_in).format("HH:mm:ss"))
                        ) ||
                        toGMT8(data).isSame(
                            toGMT8(toGMT8(userInfo?.dim_schedules[0].ref_batch_schedules.clock_out).format("HH:mm:ss"))
                        )
                    );
                }, "Clock-out must not preceed your time schedule"),
                employee_id: z.number(),
                date: z.string().nullable(),
                is_auto_approved: z.boolean().optional(),
            })
            .refine((data) => {
                console.log(toGMT8(data.clock_out).isAfter(toGMT8(data.clock_in)))
                return toGMT8(data.clock_out).isAfter(toGMT8(data.clock_in))
            }, {
                message: "Clock-out must not preceed clock-in",
                path: ['clock_out'],
            });
    }, [userInfo]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    });

    const resetFields = useCallback(() => {
        form.reset({
            reason: undefined,
            clock_in: undefined,
            clock_out: undefined,
            date: undefined,
            employee_id: undefined,
        });
    }, [form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        alert("Test");
        formSchema.parse(values);
        console.log(values);
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={() => {
                onClose();
                resetFields();
            }}
            title={"File Overtime Application"}
        >
            <Form {...form}>
                <form id="drawer-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <EmployeeListForm
                        employees={
                            employees?.map((emp) => {
                                return {
                                    department: emp.ref_job_classes.name,
                                    name: getEmpFullName(emp),
                                    id: emp.id,
                                    picture: emp.picture,
                                    employment_status: emp.ref_employment_status,
                                };
                            }) || []
                        }
                        isLoading={isLoading}
                        onSelected={(id) => {
                            form.setValue("employee_id", id);
                        }}
                    />
                    <FormFields
                        items={[
                            {
                                name: "clock_in",
                                label: "Clock In",
                                type: "time",
                            },
                            {
                                name: "clock_out",
                                label: "Clock Out",
                                type: "time",
                            },
                            {
                                name: "reason",
                                label: "Reason",
                                type: "text-area",
                            },
                        ]}
                    />
                </form>
            </Form>
        </Drawer>
    );
}

export default FileOvertime;
