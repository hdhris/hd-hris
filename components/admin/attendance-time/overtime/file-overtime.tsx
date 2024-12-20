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
import { DateValue, Spinner } from "@nextui-org/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getLocalTimeZone, today } from "@internationalized/date";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

interface FileOvertimeProps {
    isOpen: boolean;
    onClose: () => void;
}
function FileOvertime({ isOpen, onClose }: FileOvertimeProps) {
    const userInfo = useUserInfo();
    const [selectedEmployee, setSelectedEmployee] = useState<UserEmployee>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: employees, isLoading } = useQuery<UserEmployee[]>("/api/admin/utils/get-employee-search");
    const { data: existingOvertimes, isLoading: loadOvertimes } = useQuery<
        {
            employee_id: number;
            clock_in: string;
            clock_out: string;
            date: string;
        }[]
    >("/api/admin/attendance-time/overtime/file");

    const startSched = useMemo(() => {
        return toGMT8(toGMT8(selectedEmployee?.dim_schedules[0]?.ref_batch_schedules?.clock_in).format("HH:mm:ss"));
    }, [selectedEmployee]);
    const endSched = useMemo(() => {
        return toGMT8(toGMT8(selectedEmployee?.dim_schedules[0]?.ref_batch_schedules?.clock_out).format("HH:mm:ss"));
    }, [selectedEmployee]);

    const formSchema = useMemo(() => {
        console.log(selectedEmployee);
        return z
            .object({
                reason: z.string({ message: "Reason is required." }),
                clock_in: z.string().min(1, { message: "Clock In time is required." }),
                clock_out: z.string().min(1, { message: "Clock Out time is required." }),
                employee_id: z.number(),
                date: z.string(),
                is_auto_approved: z.boolean(),
            })
            .refine(
                (data) => {
                    if (!selectedEmployee) return true;
                    const clock_in = toGMT8(data.clock_in);
                    return clock_in.isSameOrAfter(startSched) && clock_in.isSameOrAfter(endSched);
                },
                {
                    message: `Clock-in must not preceed ${
                        selectedEmployee?.last_name
                    }'s shift schedule (${startSched.format("hh:mm a")} - ${endSched.format("hh:mm a")})`,
                    path: ["clock_in"],
                }
            )
            .refine(
                (data) => {
                    if (!selectedEmployee) return true;
                    const clock_out = toGMT8(data.clock_out);
                    // console.log({start: startSched.toISOString(), end: endSched.toISOString(), clock: clock_out.toISOString()})
                    // console.log(clock_out.isAfter(startSched) && clock_out.isAfter(endSched));
                    return clock_out.isAfter(startSched) && clock_out.isAfter(endSched);
                },
                {
                    message: `Clock-out must not preceed ${
                        selectedEmployee?.last_name
                    }'s shift schedule (${startSched.format("hh:mm a")} - ${endSched.format("hh:mm a")})`,
                    path: ["clock_out"],
                }
            )
            .refine(
                (data) => {
                    const clock_in = toGMT8(data.clock_in);
                    const clock_out = toGMT8(data.clock_out);

                    return clock_out.isAfter(clock_in);
                },
                {
                    message: "Clock-out must not preceed clock-in",
                    path: ["clock_out"],
                }
            );
    }, [selectedEmployee, startSched, endSched]);

    const blankFields = {
        reason: "",
        clock_in: "17:00",
        clock_out: "18:00",
        date: "",
        employee_id: undefined,
        is_auto_approved: false,
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: blankFields,
        mode: "onBlur",
    });

    useEffect(() => {
        setSelectedEmployee(employees?.find((item) => item.id === form.watch("employee_id")));
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
            if (!existingOvertimes || !selectedEmployee) return false;
            const currentDate = toGMT8(date);
            // return false;
            return existingOvertimes
                .filter((ot) => ot.employee_id === selectedEmployee.id)
                .some((overtime) => {
                    const overtimeDate = toGMT8(overtime.date);
                    return currentDate.isSame(overtimeDate, "dates");
                });
        };
    }, [selectedEmployee, existingOvertimes]);

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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            values["clock_in"] = toGMT8(values.clock_in).toISOString();
            values["clock_out"] = toGMT8(values.clock_out).toISOString();
            values["date"] = toGMT8(values.date).toISOString();
            await axios.post("/api/admin/attendance-time/overtime/file",
                {
                    ...values,
                    created_by: userInfo?.id,
                }
            );
            toast({
                title: "Request has been filed successfully!",
                variant: "success",
            });
            onClose();
            form.reset(blankFields);
        } catch (error) {
            toast({ title: `${error}`, variant: "danger" });
        }
        setIsSubmitting(false);
    }

    if (loadOvertimes) {
        return <Spinner className="h-full w-full" color="primary" content="Loading" />;
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={() => {
                onClose();
                form.reset(blankFields);
            }}
            title={"File Overtime Application"}
            isSubmitting={isSubmitting}
        >
            <Form {...form}>
                <form id="drawer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            form.setValue("employee_id", !Number.isNaN(id) ? id : 0);
                        }}
                    />
                    <FormFields
                        items={[
                            {
                                name: "date",
                                label: "Date",
                                type: "date-picker",
                                inputDisabled: !form.watch("employee_id"),
                                config: {
                                    minValue: today(getLocalTimeZone()),
                                    isDateUnavailable,
                                },
                            },
                            {
                                name: "clock_in",
                                label: "Clock In",
                                type: "time",
                                inputDisabled: !form.watch("employee_id"),
                                config: {
                                    // isInvalid: inValidClockIn,
                                },
                            },
                            {
                                name: "clock_out",
                                label: "Clock Out",
                                type: "time",
                                inputDisabled: !form.watch("employee_id"),
                                config: {
                                    // isInvalid: inValidClockOut,
                                },
                            },
                            {
                                name: "is_auto_approved",
                                label: "Auto Approved",
                                type: "switch",
                                inputDisabled: !form.watch("employee_id"),
                            },
                            {
                                name: "reason",
                                label: "Reason",
                                type: "text-area",
                                inputDisabled: !form.watch("employee_id"),
                            },
                        ]}
                    />
                </form>
            </Form>
        </Drawer>
    );
}

export default FileOvertime;
