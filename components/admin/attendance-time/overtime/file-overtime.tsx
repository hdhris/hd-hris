import Drawer from "@/components/common/Drawer";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import FormFields from "@/components/common/forms/FormFields";
import { Form } from "@/components/ui/form";
import { MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { useUserInfo } from "@/lib/utils/getEmployeInfo";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateValue } from "@nextui-org/react";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getLocalTimeZone, parseAbsolute } from "@internationalized/date";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { fetchAttendanceData } from "@/app/(admin)/(core)/attendance-time/records/stage";
import QuickFileUpload from "../../../common/QuickFileUpload";

interface FileOvertimeProps {
    isOpen: boolean;
    onClose: () => void;
}
function FileOvertime({ isOpen, onClose }: FileOvertimeProps) {
    const userInfo = useUserInfo();
    const [selectedEmployee, setSelectedEmployee] = useState<MajorEmployee>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: employees, isLoading } = useQuery<MajorEmployee[]>("/api/admin/utils/get-employee-search");
    const [availableOvertimes, setAvailableOvertimes] = useState<
        {
            id?: number | null;
            timestamp?: string | null;
            minutes: number;
            amount: number;
        }[]
    >([]);

    const findLog = useMemo(() => {
        return (date: DateValue | null) => {
            if (!date || availableOvertimes.length === 0) return;
            const tempDate = toGMT8(date.toDate(getLocalTimeZone())).toISOString();
            const foundLog = availableOvertimes.find((overtime) => {
                const timestamp = toGMT8(overtime?.timestamp?.replace(" ", "T").split("T")[0]);
                const currentDate = toGMT8(tempDate.replace(" ", "T").split("T")[0]);
                return timestamp.isSame(currentDate);
            });
            if (foundLog) setValue("requested_mins", foundLog.minutes);

            return foundLog;
        };
    }, [availableOvertimes]);

    const formSchema = z
        .object({
            reason: z.string().min(1, "Reason is required."),
            employee_id: z.number().min(1, "Please select an employee"),
            timestamp: z.string(),
            log_id: z.number().min(1, "No valid log is referenced"),
            files: z.array(z.string()),
            is_auto_approved: z.boolean(),
            requested_mins: z.number(),
        })
        .refine(
            (data) => {
                const renderedMins = availableOvertimes.find(item => item.id === data.log_id)?.minutes;
                if(!renderedMins) return false;
                return data.requested_mins <= renderedMins;
            },
            {
                message: "Duration must not exceed rendered overtime",
                path: ["requested_mins"],
            }
        )
        .refine(
            (data) => {
                if(data.is_auto_approved){
                    return data.files.length > 0;
                }
                return true;
            },
            {
                message: "Attachment is required for auto approval",
                path: ["is_auto_approved"],
            }
        )

    const blankFields = {
        reason: "",
        employee_id: undefined,
        is_auto_approved: false,
        log_id: undefined,
        timestamp: undefined,
        files: [],
        requested_mins: 0,
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: blankFields,
        mode: "onBlur",
    });

    const { setValue, watch, reset, handleSubmit } = form;

    useEffect(() => {
        if (selectedEmployee) {
            async function doFetch() {
                const data = await fetchAttendanceData(
                    `/api/admin/attendance-time/records?start=${toGMT8()
                        .subtract(1, "months")
                        .format("YYYY-MM-DD")}&end=${toGMT8().format("YYYY-MM-DD")}&employee_id=${selectedEmployee!.id}`
                );
                const reshaped = Object.entries(data.statusesByDate)
                    .filter(([, employees]) => Object.values(employees).some((status) => status.renderedOvertime > 0 && status.paidOvertime === 0))
                    .flatMap(([, employees]) =>
                        Object.entries(employees)
                            .filter(([, status]) => status.renderedOvertime > 0)
                            .map(([, status]) => ({
                                id: status.pmOut?.id,
                                timestamp: toGMT8(String(status.pmOut?.time)).subtract(status.renderedOvertime, 'minutes').toISOString(),
                                minutes: status.renderedOvertime,
                                amount: status.paidOvertime,
                            }))
                    );
                setAvailableOvertimes(reshaped);
            }
            doFetch();
        }
    }, [selectedEmployee]);

    useEffect(() => {
        setSelectedEmployee(employees?.find((item) => item.id === watch("employee_id")));
    }, [employees, watch("employee_id")]);

    const isDateUnavailable = useMemo(() => {
        return (date: DateValue) => {
            if (availableOvertimes.length === 0) return true;
            const tempDate = toGMT8(date.toDate(getLocalTimeZone())).toISOString();
            return !availableOvertimes.some((overtime) => {
                const timestamp = toGMT8(overtime?.timestamp?.replace(" ", "T").split("T")[0]);
                const currentDate = toGMT8(tempDate.replace(" ", "T").split("T")[0]);
                return timestamp.isSame(currentDate);
            });
        };
    }, [availableOvertimes]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            await axios.post("/api/admin/attendance-time/overtime/file", {
                ...values,
                created_by: userInfo?.id,
            });
            toast({
                title: "Request has been filed successfully!",
                variant: "success",
            });
            onClose();
            reset(blankFields);
        } catch (error) {
            toast({ title: `${error}`, variant: "danger" });
        }
        setIsSubmitting(false);
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={() => {
                onClose();
                reset(blankFields);
            }}
            title={"File Overtime Application"}
            isSubmitting={isSubmitting}
        >
            <Form {...form}>
                <form id="drawer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                            setValue("employee_id", !Number.isNaN(id) ? id : 0);
                        }}
                    />
                    <FormFields
                        items={[
                            {
                                name: "date",
                                label: "Log Date",
                                type: "date-picker",
                                inputDisabled: !watch("employee_id"),
                                config: {
                                    minValue: parseAbsolute(
                                        toGMT8().subtract(1, "months").toISOString(),
                                        getLocalTimeZone()
                                    ),
                                    isClearable: true,
                                    isDateUnavailable,
                                    onChange: (value: DateValue | null) => {
                                        setValue("date" as any, value);
                                        const log = findLog(value);
                                        if(log){
                                            setValue("log_id", log.id ?? 0);
                                            setValue("timestamp", String(log.timestamp));
                                        }
                                    },
                                },
                            },
                            {
                                name: "requested_mins",
                                label: "Requesting Duration",
                                type: "number",
                                inputDisabled: !watch("log_id"),
                            },
                            {
                                name: "reason",
                                label: "Reason",
                                type: "text-area",
                                inputDisabled: !watch("log_id"),
                            },
                            {
                                name: "is_auto_approved",
                                label: "Auto Approved",
                                type: "switch",
                                config: {
                                    isDisabled: !watch("log_id"),
                                },
                            },
                        ]}
                    />
                    <QuickFileUpload/>
                </form>
            </Form>
        </Drawer>
    );
}

export default FileOvertime;
