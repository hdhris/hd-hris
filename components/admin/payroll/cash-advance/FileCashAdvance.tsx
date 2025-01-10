import Drawer from "@/components/common/Drawer";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";
import FormFields from "@/components/common/forms/FormFields";
import { BorderedCard, EmployeeHeader } from "@/components/common/minor-items/components";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { formatCurrency } from "@/lib/utils/numberFormat";
import { useQuery } from "@/services/queries";
import { ApprovalStatusType } from "@/types/attendance-time/OvertimeType";
import { PaymentMethod } from "@/types/payroll/cashAdvanceType";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type CashAdvanceFormType = {
    isOpen: boolean;
    onClose: () => void;
};

const cashAdvanceSchema = z.object({
    id: z.number().optional(),
    employee_id: z.number(),
    amount_requested: z.number(),
    reason: z.string().optional(),
    status: z.enum(["pending", "approved", "rejected"]),
    payment_method: z.enum(["payroll", "cash", "bank_transfer", "other"]),
});

function FileCashAdvance({ isOpen, onClose }: CashAdvanceFormType) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: employees, isLoading } = useQuery<MajorEmployee[]>("/api/admin/utils/get-employee-search");

    const defaultValues = {
        id: undefined,
        amount_requested: 0,
        employee_id: undefined,
        reason: "",
        status: "pending" as ApprovalStatusType,
        payment_method: "payroll" as PaymentMethod,
    };

    const form = useForm<z.infer<typeof cashAdvanceSchema>>({
        resolver: zodResolver(cashAdvanceSchema),
        defaultValues,
    });

    const { watch } = form;

    const employee = useMemo(() => {
        if (employees) {
            return employees.find((employee) => employee.id === watch("employee_id"));
        }
    }, [employees, watch("employee_id")]);

    function reset() {
        form.reset(defaultValues);
    }

    async function onSubmit(value: z.infer<typeof cashAdvanceSchema>) {
        setIsSubmitting(true);
        try {
            console.log(value);
            await axios.post("/api/admin/payroll/cash-advance/file-advancement", value);
            toast({ title: "Cash advancement filed successfully", variant: "success" });
            reset();
            onClose();
        } catch (error) {
            toast({ title: "Failed to file cash advancement", description: String(error), variant: "danger" });
        }
        setIsSubmitting(false);
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={() => {
                onClose();
                reset();
            }}
            title={"File Cash Advance"}
            unSubmittable={!form.watch("employee_id")}
            isSubmitting={isSubmitting}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} id="drawer-form" className="space-y-4">
                    {employee ? (
                        <>
                            <EmployeeHeader employee={employee} onClose={reset} />
                            <BorderedCard
                                icon={<div />}
                                title={employee.ref_salary_grades.name}
                                description={formatCurrency(employee.ref_salary_grades.amount)}
                            />
                        </>
                    ) : (
                        <EmployeeListForm
                            isLoading={isLoading}
                            employees={
                                employees?.map((emp) => ({
                                    id: emp.id,
                                    name: getEmpFullName(emp),
                                    picture: emp.picture,
                                    department: emp.ref_departments?.name,
                                })) ?? []
                            }
                        />
                    )}
                    <FormFields
                        items={[
                            {
                                name: "amount_requested",
                                type: "number",
                                label: "Requesting Amount",
                                isRequired: true,
                                inputDisabled: !form.watch("employee_id"),
                            },
                            {
                                name: "reason",
                                label: "Reason",
                                type: "text-area",
                                inputDisabled: !form.watch("employee_id"),
                            },
                            // {
                            //     name: "payment_method",
                            //     label: "Payment Method",
                            //     type: "radio-group",
                            //     inputDisabled: !form.watch("employee_id"),
                            //     config: {
                            //         //"payroll", "cash", "bank_transfer", "other"
                            //         options: [
                            //             {
                            //                 label: "Cash",
                            //                 value: "cash",
                            //             },
                            //             {
                            //                 label: "Payroll",
                            //                 value: "payroll",
                            //             },
                            //             {
                            //                 label: "Bank Transfer",
                            //                 value: "bank_transfer",
                            //             },
                            //             {
                            //                 label: "Other",
                            //                 value: "other",
                            //             },
                            //         ],
                            //     },
                            // },
                        ]}
                    />
                </form>
            </Form>
        </Drawer>
    );
}

export default FileCashAdvance;
