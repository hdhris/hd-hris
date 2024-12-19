import Drawer from "@/components/common/Drawer";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import FormFields from "@/components/common/forms/FormFields";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { UserEmployee } from "@/helper/include-emp-and-reviewr/include";
import { tryParse } from "@/helper/objects/jsonParserType";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { formatCurrency } from "@/lib/utils/numberFormat";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { ApprovalStatusType } from "@/types/attendance-time/OvertimeType";
import { LoanRequest } from "@/types/payroll/cashAdvanceType";
import { Avatar, Button, Chip, cn, Spacer, Textarea } from "@nextui-org/react";
import { CalendarIcon } from "@radix-ui/react-icons";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type CashAdvanceFormType = {
    isOpen: boolean;
    onClose: (value: boolean) => void;
    onApproval: (id: number, status: ApprovalStatusType) => Promise<void>;
    mutate: () => void;
    cashAdvance: LoanRequest | null;
};

const cashAdvanceSchema = z.object({
    id: z.number().optional(),
    employee_id: z.number(),
    amount_requested: z.string(),
    reason: z.string().optional(),
    status: z.enum(["pending", "approved", "rejected"]),
    approval_by: z.number(),
    approval_at: z.string(),
    comment: z.string().optional(),
    created_at: z.string(),
});

function CashAdvanceForm({ isOpen, onClose, cashAdvance, mutate, onApproval}: CashAdvanceFormType) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: employees, isLoading } = useQuery<UserEmployee[]>("/api/admin/utils/get-employee-search");
    const form = useForm<z.infer<typeof cashAdvanceSchema>>({
        defaultValues: {},
        values: cashAdvance ?? undefined,
    });

    useEffect(() => {
        if (!cashAdvance) {
            form.reset({
                id: undefined,
                amount_requested: "0.0",
                approval_at: undefined,
                approval_by: undefined,
                comment: "",
                created_at: undefined,
                employee_id: undefined,
                reason: "",
                status: "pending",
            });
        }
    }, [cashAdvance, form.reset, form]);

    async function onSubmit(value: z.infer<typeof cashAdvanceSchema>) {
        setIsSubmitting(true);
        try {
            console.log(value);
            await axios.post("/api/admin/payroll/cash-advance/file-advancement", value);
            toast({ title: "Cash advancement filed successfully", variant: "success" });
            onClose(false);
            mutate();
        } catch (error) {
            toast({ title: "Failed to file cash advancement", description: String(error), variant: "danger" });
        }
        setIsSubmitting(false);
    }

    async function onApprovalBtn(id: number, status: ApprovalStatusType) {
        setIsSubmitting(true);
        await onApproval(id, status);
        onClose(false);
        mutate();
        setIsSubmitting(false);
    }

    const currentEmployee = useMemo(() => {
        if (cashAdvance && employees) {
            return employees?.find((emp) => emp.id === cashAdvance.employee_id);
        }
    }, [employees, cashAdvance]);

    const approverInfo = useMemo(() => {
        if (cashAdvance && employees) {
            return employees?.find((emp) => emp.id === cashAdvance.approval_by);
        }
    }, [employees, cashAdvance]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return toGMT8(dateString).format('MMM DD, YYYY HH:mm');
    };

    const getStatusColor = (status: ApprovalStatusType) => {
        switch (status.toLowerCase()) {
            case "approved":
                return "success";
            case "pending":
                return "warning";
            case "rejected":
                return "danger";
            default:
                return "default";
        }
    };

    const DetailItem = ({ label, value, icon }: { label?: string; value: React.ReactNode; icon?: React.ReactNode }) => (
        <div className="mb-4">
            {label && <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>}
            <div className={cn("flex items-center", !icon ? "text-large" : "text-medium")}>
                {icon && <span className="mr-2">{icon}</span>}
                {value}
            </div>
        </div>
    );

    const TextArea = ({ label, value }: { label: string; value: string }) => (
        <div className="mb-4">
            <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
            <div className="p-3 bg-gray-100 rounded-lg text-small whitespace-pre-wrap">{value || "N/A"}</div>
        </div>
    );


    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={"File Cash Advance"}
            unSubmittable={!form.watch("employee_id")}
            isSubmitting={isSubmitting}
            footer={
                cashAdvance?.approval_by ? (
                    <div />
                ) : (
                    cashAdvance &&
                    !cashAdvance.approval_by && (
                        <div className="flex gap-2 ms-auto">
                            <Button
                                isLoading={isSubmitting}
                                onClick={() => onApprovalBtn(cashAdvance?.id, "rejected")}
                                {...uniformStyle({ color: "danger" })}
                            >
                                Reject
                            </Button>
                            <Button
                                isLoading={isSubmitting}
                                onClick={() => onApprovalBtn(cashAdvance?.id, "approved")}
                                className="text-white"
                                {...uniformStyle({ color: "success" })}
                            >
                                Accept
                            </Button>
                        </div>
                    )
                )
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} id="drawer-form" className="space-y-4">
                    {currentEmployee && cashAdvance ? (
                        <>
                            <div>
                                <DetailItem
                                    value={<span className="font-semibold">{getEmpFullName(currentEmployee)}</span>}
                                    icon={<Avatar src={currentEmployee.picture} size="sm" />}
                                />
                                <DetailItem
                                    label="Amount Requested"
                                    value={
                                        <span className="font-semibold">
                                            {formatCurrency(cashAdvance.amount_requested)}
                                        </span>
                                    }
                                />
                                <DetailItem
                                    label="Status"
                                    value={
                                        <Chip color={getStatusColor(cashAdvance.status)} variant="flat">
                                            {cashAdvance.status.toUpperCase()}
                                        </Chip>
                                    }
                                />
                                <DetailItem
                                    label="Requested Date"
                                    value={formatDate(cashAdvance.created_at)}
                                    icon={<CalendarIcon className="w-4 h-4" />}
                                />
                                <Spacer y={4} />
                                <TextArea label="Reason" value={cashAdvance.reason} />
                                {!approverInfo ? (
                                    <>
                                        <div className="text-sm font-medium text-gray-500 mb-1">Comment</div>
                                        <Textarea
                                            name="comment"
                                            value={form.watch("comment")}
                                            onValueChange={(value) => form.setValue("comment", value)}
                                            variant="bordered"
                                            radius="none"
                                        />
                                    </>
                                ) : (
                                    <TextArea label="Comment" value={cashAdvance.comment || ""} />
                                )}
                                {approverInfo && (
                                    <>
                                        <DetailItem
                                            label="Approval By"
                                            value={<span className="text-small">{getEmpFullName(approverInfo)}</span>}
                                            icon={<Avatar src={approverInfo.picture} size="sm" />}
                                        />
                                        <DetailItem
                                            label="Reviewed Date"
                                            value={formatDate(cashAdvance.approval_at)}
                                            icon={<CalendarIcon className="w-4 h-4" />}
                                        />
                                    </>
                                )}
                                {/* <DetailItem
                            label="Updated At"
                            value={formatDate(cashAdvance.updated_at)}
                            icon={<CalendarIcon className="w-4 h-4" />}
                        /> */}
                            </div>
                        </>
                    ) : (
                        <>
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
                                    console.log(id);
                                    form.setValue("employee_id", id);
                                }}
                            />
                            <FormFields
                                items={[
                                    {
                                        name: "amount_requested",
                                        type: "number",
                                        label: "Requesting Amount",
                                        isRequired: true,
                                    },
                                    {
                                        name: "reason",
                                        label: "Reason",
                                        type: "text-area",
                                    },
                                    {
                                        name: "comment",
                                        label: "Comment",
                                        type: "text-area",
                                    },
                                ]}
                            />
                        </>
                    )}
                </form>
            </Form>
        </Drawer>
    );
}

export default CashAdvanceForm;
