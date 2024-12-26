"use client";
import UserMail from "@/components/common/avatar/user-info-mail";
import Drawer from "@/components/common/Drawer";
import FormFields from "@/components/common/forms/FormFields";
import QuickModal from "@/components/common/QuickModal";
import TableData from "@/components/tabledata/TableData";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { MinorEmployee, MajorEmployee, BasicEmployee } from "@/helper/include-emp-and-reviewr/include";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { ApprovalStatusType } from "@/types/attendance-time/OvertimeType";
import { phaseArray } from "@/types/performance/types";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { getLocalTimeZone, parseAbsolute } from "@internationalized/date";
import { Avatar, Card, cn, ScrollShadow } from "@nextui-org/react";
import axios from "axios";
import { capitalize } from "lodash";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { HiDocumentPlus } from "react-icons/hi2";
import { IoMdClock } from "react-icons/io";
import { MdHistoryToggleOff } from "react-icons/md";
import { RiFileHistoryFill } from "react-icons/ri";
import { z } from "zod";

function Page() {
    const router = useRouter();
    const { data: employees } = useQuery<BasicEmployee[]>("/api/admin/performance/employees");
    const [selectedEmployee, setSelectedEmployee] = useState<{
        evaluation_history: {
            start_date: string;
            end_date: string;
            phase: string;
            id: number;
            status: ApprovalStatusType;
        }[];
        employee: BasicEmployee;
        next_interval: number;
        start_date: string;
        end_date: string;
    } | null>(null);
    const [isCreatingAppraisal, setIsCreatingAppraisal] = useState(false);
    const userID = useEmployeeId();

    const formSchema = z.object({
        start_date: z.string(),
        end_date: z.string(),
        employment_status: z.number(),
        employee_id: z.number(),
        evaluated_by: z.number(),
        phase: z.enum(phaseArray),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
        mode: "onSubmit",
    });

    const { reset, watch, handleSubmit } = form;

    async function surveyEmployee(id: React.Key) {
        try {
            const result = (await axios.get(`/api/admin/performance/employees/file?employee_id=${String(id)}`)).data;
            setSelectedEmployee(result);
        } catch (error) {
            toast({
                title: String(error),
                variant: "danger",
            });
        }
    }

    async function onSubmit(value: z.infer<typeof formSchema>) {
        try {
            const result = (await axios.post("/api/admin/performance/employees/file", value)).data;
            if (result?.status) {
                router.push(`/performance/employees/survey?id=${result.id}`);
            } else {
                throw new Error(String(result.message));
            }
        } catch (error) {
            toast({
                title: String(error),
                variant: "danger",
            });
        }
    }

    const RowItem = ({
        icon,
        title,
        description,
        onPress,
        isPressable,
        color = "default",
    }: {
        icon: React.ReactNode;
        title: string;
        description: string;
        onPress?: () => void;
        isPressable?: boolean;
        color?: "danger" | "warning" | "success" | "default";
    }) => {
        return (
            <Card
                isPressable={isPressable}
                onPress={onPress}
                shadow="none"
                className={cn(
                    "border p-4 flex-row justify-between items-center w-full",
                    color === "danger"
                        ? "border-danger-500 text-danger-500 bg-red-50"
                        : color === "warning"
                        ? "border-warning-500 text-warning-500 bg-warning-50"
                        : color === "success"
                        ? "border-success-500 text-success-500 bg-success-50"
                        : ""
                )}
            >
                <div>
                    <p className="text-small font-semibold text-start">{title}</p>
                    <p className="text-small text-start">{description}</p>
                </div>
                {icon}
            </Card>
        );
    };

    return (
        <div>
            <TableData items={employees || []} config={config} onRowAction={surveyEmployee} />
            <Drawer isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)}>
                {selectedEmployee && (
                    <div className="h-full space-y-4">
                        <div className="flex items-center gap-4 p-2">
                            <Avatar isBordered src={selectedEmployee.employee.picture} />
                            <div>
                                <p className="text-medium font-semibold">{getEmpFullName(selectedEmployee.employee)}</p>
                                <p className="text-sm">{selectedEmployee.employee.ref_job_classes.name}</p>
                            </div>
                        </div>
                        <ScrollShadow className="space-y-2">
                            {selectedEmployee.next_interval <= 0 ? (
                                <RowItem
                                    isPressable
                                    color="success"
                                    title="File Evaluation"
                                    icon={<HiDocumentPlus />}
                                    description={`${toGMT8(selectedEmployee.start_date).format(
                                        "MMM DD, YYYY"
                                    )} to ${toGMT8(selectedEmployee.end_date).format("MMM DD, YYYY")}`}
                                    onPress={() => {
                                        reset({
                                            employee_id: selectedEmployee.employee.id,
                                            start_date: selectedEmployee.start_date,
                                            end_date: selectedEmployee.end_date,
                                            employment_status: selectedEmployee.employee.ref_employment_status.id,
                                            phase: "first",
                                            evaluated_by: userID,
                                        });
                                        setIsCreatingAppraisal(true);
                                    }}
                                />
                            ) : (
                                <RowItem
                                    color="danger"
                                    title={`Next performance appraisal in ${toGMT8(selectedEmployee.end_date).diff(
                                        toGMT8(),
                                        "months"
                                    )} months`}
                                    icon={<IoMdClock />}
                                    description={`${toGMT8(selectedEmployee.start_date).format(
                                        "MMM DD, YYYY"
                                    )} to ${toGMT8(selectedEmployee.end_date).format("MMM DD, YYYY")}`}
                                />
                            )}
                            {selectedEmployee.evaluation_history.length > 0 &&
                                selectedEmployee.evaluation_history.map((evaluation, index) => (
                                    <RowItem
                                        key={index} //Fixed: Missing key
                                        isPressable
                                        color={evaluation.status === "pending" ? "warning" : undefined}
                                        title={`${capitalize(evaluation.phase)} phase evaluation as ${
                                            selectedEmployee.employee.ref_employment_status.name
                                        } in ${toGMT8(evaluation.start_date).year()}`}
                                        icon={<RiFileHistoryFill />}
                                        description={`${toGMT8(evaluation.start_date).format(
                                            "MMM DD, YYYY"
                                        )} to ${toGMT8(evaluation.end_date).format("MMM DD, YYYY")}`}
                                        onPress={() => router.push(`/performance/employees/survey?id=${evaluation.id}`)}
                                    />
                                ))}
                        </ScrollShadow>
                        <p className="max-w-[300px]">{JSON.stringify(selectedEmployee)}</p>
                    </div>
                )}
            </Drawer>
            <QuickModal
                size="sm"
                title="Create Performance Evaluation"
                isOpen={isCreatingAppraisal}
                buttons={{
                    onClose: {
                        label: "Cancel",
                    },
                    onAction: {
                        form: "create-survey",
                        label: "Create",
                        onPress: handleSubmit(onSubmit), // Correctly call handleSubmit here
                    },
                }}
                onClose={() => setIsCreatingAppraisal(false)}
            >
                <Form {...form}>
                    <form id="create-survey">
                        <FormFields<z.infer<typeof formSchema>>
                            items={[
                                {
                                    name: "start_date",
                                    label: "Start Date",
                                    type: "date-picker",
                                    isRequired: true,
                                    config: {
                                        showMonthAndYearPickers: true,
                                        maxValue: parseAbsolute(
                                            toGMT8(watch("end_date"))
                                                .subtract(
                                                    selectedEmployee?.employee?.ref_employment_status
                                                        ?.appraisal_interval ?? 0,
                                                    "months"
                                                )
                                                .toISOString(),
                                            getLocalTimeZone()
                                        ),
                                    },
                                },
                                {
                                    name: "end_date",
                                    label: "End Date",
                                    type: "date-picker",
                                    isRequired: true,
                                    config: {
                                        showMonthAndYearPickers: true,
                                        minValue: parseAbsolute(
                                            toGMT8(watch("start_date")).toISOString(),
                                            getLocalTimeZone()
                                        ),
                                        maxValue: parseAbsolute(toGMT8().toISOString(), getLocalTimeZone()),
                                    },
                                },
                                {
                                    name: "phase",
                                    label: "Phase",
                                    type: "select",
                                    config: {
                                        options: phaseArray
                                            .slice(
                                                0,
                                                Math.round(
                                                    12 /
                                                        (selectedEmployee?.employee?.ref_employment_status
                                                            ?.appraisal_interval ?? 6)
                                                )
                                            )
                                            .map((phase) => ({
                                                label: capitalize(phase),
                                                value: phase,
                                            })),
                                    },
                                },
                            ]}
                        />
                    </form>
                </Form>
            </QuickModal>
        </div>
    );
}

export default Page;

const config: TableConfigProps<MinorEmployee> = {
    columns: [{ uid: "name", name: "Name", sortable: true }],
    rowCell: (item, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <div>
                        <UserMail name={getEmpFullName(item)} picture={item.picture} email={item.email} />
                    </div>
                );
            default:
                return <></>;
        }
    },
};
