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
import { DateValue } from "@nextui-org/react";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { normalizeDate } from "../../leaves/request-form/form/RequestForm";
import { getLocalTimeZone, today } from "@internationalized/date";

interface FileOvertimeProps {
    isOpen: boolean;
    onClose: () => void;
}
function FileOvertime({ isOpen, onClose }: FileOvertimeProps) {
    const userInfo = useUserInfo();
    const { data: employees, isLoading } = useQuery<UserEmployee[]>("/api/admin/utils/get-employee-search");
    const { data: existingOvertimes, isLoading: loadOvertimes} = useQuery<{
        employee_id: number;
        clock_in: string;
        clock_out: string;
        date: string;
    }[]>("");

    const formSchema = z.object({
        reason: z.string({ message: "Reason is required." }),
        clock_in: z.string().min(1, { message: "Clock In time is required." }),
        clock_out: z.string().min(1, { message: "Clock Out time is required." }),
        employee_id: z.number(),
        date: z.string(),
        is_auto_approved: z.boolean().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    });

    const selectedEmployee = useMemo(() => {
        return employees?.find((item) => item.id === form.watch("employee_id"));
    }, [employees, form, form.watch("employee_id")]);

    useEffect(() => {
        if (selectedEmployee?.dim_schedules[0]?.ref_batch_schedules) {
            form.setValue(
                "clock_in",
                toGMT8(selectedEmployee.dim_schedules[0].ref_batch_schedules.clock_out).format("HH:mm:ss")
            );
            form.setValue(
                "clock_out",
                toGMT8(selectedEmployee.dim_schedules[0].ref_batch_schedules.clock_out)
                    .add(1, "hours")
                    .format("HH:mm:ss")
            );
        } else {
            form.setValue("clock_in", "17:00");
            form.setValue("clock_out", "18:00");
        }
    }, [selectedEmployee, form]);

    const haveExistingOvertime = useMemo(() => {
        return (date: Date): boolean => {
            const currentDate = toGMT8(date);
            return false;
            // return data?.some((overtime) => {
            //     const overtimeDate = toGMT8(overtime.date);
            //     return currentDate.isSame(overtimeDate, 'dates');
            // });
        };
    }, [selectedEmployee]);

    const isDateUnavailable = useMemo(() => {
        return (date: DateValue) => {
            const currentDate = date.toDate(getLocalTimeZone());
            if (selectedEmployee) {
                const dayOfWeek = currentDate.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
                return (
                    haveExistingOvertime(currentDate) ||
                    !selectedEmployee.dim_schedules?.[0]?.days_json?.includes(dayOfWeek)
                );
            }
            return false;
        };
    }, [selectedEmployee, haveExistingOvertime]);

    const inValidClockIn = useMemo(() => {
        const clock_in = form.watch("clock_in");
        if (
            selectedEmployee &&
            (toGMT8(clock_in).isBefore(
                toGMT8(toGMT8(selectedEmployee.dim_schedules[0].ref_batch_schedules.clock_in).format("HH:mm:ss"))
            ) ||
                toGMT8(clock_in).isBefore(
                    toGMT8(toGMT8(selectedEmployee.dim_schedules[0].ref_batch_schedules.clock_out).format("HH:mm:ss"))
                ))
        ) {
            // console.log("Invalid clock in", selectedEmployee);
            form.setError("clock_in", { message: "Clock-in must not preceed your time schedule" });
            return true;
        }
        return false;
    }, [form, form.watch("clock_in"), selectedEmployee, form.setError]);

    const inValidClockOut = useMemo(() => {
        const clock_out = form.watch("clock_out");
        const clock_in = form.watch("clock_in");
        if (
            selectedEmployee &&
            (toGMT8(clock_out).isBefore(
                toGMT8(toGMT8(selectedEmployee.dim_schedules[0].ref_batch_schedules.clock_in).format("HH:mm:ss"))
            ) ||
                toGMT8(clock_out).isBefore(
                    toGMT8(toGMT8(selectedEmployee.dim_schedules[0].ref_batch_schedules.clock_out).format("HH:mm:ss"))
                ) ||
                toGMT8(clock_out).isSame(
                    toGMT8(toGMT8(selectedEmployee.dim_schedules[0].ref_batch_schedules.clock_in).format("HH:mm:ss"))
                ) ||
                toGMT8(clock_out).isSame(
                    toGMT8(toGMT8(selectedEmployee.dim_schedules[0].ref_batch_schedules.clock_out).format("HH:mm:ss"))
                ))
        ) {
            // console.log(selectedEmployee);
            form.setError("clock_out", { message: "Clock-out must not preceed your time schedule" });
            return true;
        }
        if (toGMT8(clock_out).isBefore(toGMT8(clock_in))) {
            form.setError("clock_out", { message: "Clock-out must not preceed clock-in" });
            return true;
        }
        return false;
    }, [form, form.watch("clock_out"), form.watch("clock_in"), selectedEmployee, form.setError]);

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
            unSubmittable={inValidClockOut || inValidClockIn}
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
                            form.setValue("employee_id", !Number.isNaN(id) ? id: 0);
                        }}
                    />
                    <FormFields
                        items={[
                            {
                                name: "date",
                                label: "Date",
                                type: "date-picker",
                                config: {
                                    minValue: today(getLocalTimeZone()),
                                    isDateUnavailable,
                                },
                            },
                            {
                                name: "clock_in",
                                label: "Clock In",
                                type: "time",
                                config: {
                                    isInvalid: inValidClockIn,
                                }
                            },
                            {
                                name: "clock_out",
                                label: "Clock Out",
                                type: "time",
                                config: {
                                    isInvalid: inValidClockOut,
                                }
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
