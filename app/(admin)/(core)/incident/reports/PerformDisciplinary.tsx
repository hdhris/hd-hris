import FormFields from "@/components/common/forms/FormFields";
import QuickModal from "@/components/common/QuickModal";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import showDialog from "@/lib/utils/confirmDialog";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { IncidentReport } from "@/types/incident-reports/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseAbsoluteToLocal } from "@internationalized/date";
import axios from "axios";
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const today = toGMT8().startOf("day");
interface PerformDisciplinaryProp {
    isOpen: boolean;
    report: IncidentReport | null;
    onClose: () => void;
}

function PerformDisciplinary({ isOpen, report, onClose }: PerformDisciplinaryProp) {
    const [isLoading, setIsLoading] = useState(false);

    const childRef = useRef<{ childFunction: () => void }>(null);

    // Function to trigger the child's function
    const handleTrigger = async () => {
        if (childRef.current) {
            setIsLoading(true);
            await childRef.current.childFunction(); // Call the child's function
            setIsLoading(false);
        }
    };

    return (
        <QuickModal
            title={report?.actions_taken ?? "Disciplinary"}
            isOpen={isOpen}
            onClose={onClose}
            buttons={{
                onClose: {
                    label: "Close",
                    onPress: onClose,
                },
                onAction: {
                    label: "Confirm",
                    onPress: handleTrigger,
                    isLoading,
                },
            }}
        >
            {report?.actions_taken === "Demotion" ? (
                <Demotion report={report} afterSubmit={onClose} />
            ) : report?.actions_taken === "Payroll Deduction" ? (
                <Deduction report={report} afterSubmit={onClose} />
            ) : report?.actions_taken === "Re-Education" ? (
                <ReEducation report={report} afterSubmit={onClose} />
            ) : report?.actions_taken === "Reassignment" ? (
                <Reassignment report={report} afterSubmit={onClose} />
            ) : report?.actions_taken === "Suspension" ? (
                <Suspension ref={childRef} report={report} afterSubmit={onClose} />
            ) : (
                report?.actions_taken === "Termination" && <Termination ref={childRef} report={report} afterSubmit={onClose} />
            )}
        </QuickModal>
    );
}
export default PerformDisciplinary;

function Demotion({ report, afterSubmit }: { report: IncidentReport; afterSubmit: () => void }) {
    return <div>{JSON.stringify(report)}</div>;
}

function Deduction({ report, afterSubmit }: { report: IncidentReport; afterSubmit: () => void }) {
    return <div>{JSON.stringify(report)}</div>;
}

function ReEducation({ report, afterSubmit }: { report: IncidentReport; afterSubmit: () => void }) {
    return <div>{JSON.stringify(report)}</div>;
}

function Reassignment({ report, afterSubmit }: { report: IncidentReport; afterSubmit: () => void }) {
    return <div>{JSON.stringify(report)}</div>;
}
const Suspension = forwardRef<
    { childFunction: () => void }, // Ref type
    { report: IncidentReport; afterSubmit: () => void } // Props type
>(({ report, afterSubmit }, ref) => {
    const userID = useEmployeeId();
    const formSchema = z.object({ start_date: z.string(), end_date: z.string() });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { start_date: today.toISOString(), end_date: today.add(3, "days").toISOString() },
    });
    const onsubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        const result = await showDialog({
            title: "Suspend Employee",
            message: "Are you sure to suspend this employee?",
            preferredAnswer: "no",
        })
        if(result != "yes") return
        try{
            // employee_id, initiated_by, start_date, reason, incident_id
            await axios.post("/api/admin/incident/suspend", {
                ...values,
                initiated_by: userID,
                employee_id: report.employee_id,
                incident_id: report.id,
                reason: report.description,
            });
            toast({
                title: "Employee suspended successfully",
                variant: "default"
            })
            afterSubmit(); // Call the afterSubmit prop
        } catch(error){
            toast({
                title: String(error),
                variant: "danger",
            })
        }
    },[userID, report]);
    const childFunction = async () => {
        await form.handleSubmit(onsubmit)();
    };
    useImperativeHandle(ref, () => ({
        childFunction,
    }));
    return (
        <Form {...form}>
            <form id="incident-form" className="space-y-4">
                <FormFields<z.infer<typeof formSchema>>
                    items={[
                        {
                            name: "start_date",
                            label: "Start Date",
                            type: "date-picker",
                            config: {
                                minValue: parseAbsoluteToLocal(today.toISOString()),
                            },
                        },
                        {
                            name: "end_date",
                            label: "End Date",
                            type: "date-picker",
                            config: {
                                minValue: parseAbsoluteToLocal(today.toISOString()),
                            },
                        },
                    ]}
                />
            </form>
        </Form>
    );
});

const Termination = forwardRef<
    { childFunction: () => void }, // Ref type
    { report: IncidentReport; afterSubmit: () => void } // Props type
>(({ report, afterSubmit }, ref) => {
    const userID = useEmployeeId();
    const formSchema = z.object({ start_date: z.string() });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { start_date: today.toISOString() },
    });
    const onsubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        const result = await showDialog({
            title: "Terminate Employee",
            message: "Are you sure to terminate this employee?",
            preferredAnswer: "no",
        })
        if(result != "yes") return
        try{
            // employee_id, initiated_by, start_date, reason, incident_id
            await axios.post("/api/admin/incident/terminate", {
                ...values,
                initiated_by: userID,
                employee_id: report.employee_id,
                incident_id: report.id,
                reason: report.description,
            });
            toast({
                title: "Employee terminated successfully",
                variant: "default"
            })
            afterSubmit(); // Call the afterSubmit prop
        } catch(error){
            toast({
                title: String(error),
                variant: "danger",
            })
        }
    },[userID, report]);
    const childFunction = async () => {
        await form.handleSubmit(onsubmit)();
    };
    useImperativeHandle(ref, () => ({
        childFunction,
    }));
    return (
        <Form {...form}>
            <form id="incident-form" className="space-y-4">
                <FormFields<z.infer<typeof formSchema>>
                    items={[
                        {
                            name: "start_date",
                            label: "Start Date",
                            type: "date-picker",
                            config: {
                                minValue: parseAbsoluteToLocal(today.toISOString()),
                            },
                        },
                    ]}
                />
            </form>
        </Form>
    );
});