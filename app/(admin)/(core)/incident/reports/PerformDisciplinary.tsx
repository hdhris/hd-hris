import FormFields from "@/components/common/forms/FormFields";
import QuickModal from "@/components/common/QuickModal";
import {Form} from "@/components/ui/form";
import {toast} from "@/components/ui/use-toast";
import {useEmployeeId} from "@/hooks/employeeIdHook";
import showDialog from "@/lib/utils/confirmDialog";
import {toGMT8} from "@/lib/utils/toGMT8";
import {IncidentReport} from "@/types/incident-reports/type";
import {zodResolver} from "@hookform/resolvers/zod";
import {parseAbsoluteToLocal} from "@internationalized/date";
import axios from "axios";
import React, {forwardRef, useCallback, useImperativeHandle, useRef, useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";

const today = toGMT8().startOf("day");

interface PerformDisciplinaryProp {
    isOpen: boolean;
    report: IncidentReport | null;
    onClose: () => void;
    onSuccess: () => void;
}

function PerformDisciplinary({isOpen, report, onClose, onSuccess}: PerformDisciplinaryProp) {
    const [isLoading, setIsLoading] = useState(false);

    const childRef = useRef<{ childFunction: () => void }>(null);

    // Function to trigger the child's function
    const handleTrigger = async () => {
        if (childRef.current) {
            setIsLoading(true);
            await childRef.current.childFunction(); // Call the child's function
            setIsLoading(false);
            onSuccess();
        }
    };

    return (<QuickModal
            title={report?.actions_taken ?? "Disciplinary"}
            isOpen={isOpen}
            onClose={onClose}
            buttons={{
                onClose: {
                    label: "Close", onPress: onClose,
                }, onAction: {
                    label: "Confirm", onPress: handleTrigger, isLoading,
                },
            }}
        >
            {// report?.actions_taken === "Demotion" ? (
                //     <Demotion report={report} afterSubmit={onClose} />
                // ) :
                report?.actions_taken === "Payroll Deduction" ? (
                    <Deduction ref={childRef} report={report} afterSubmit={onClose}/>
                    // ) : report?.actions_taken === "Written Warning" ? (
                    //     <WrittenWarning ref={childRef} report={report} afterSubmit={onClose} />
                ) : report?.actions_taken === "Send Warning" ? (
                    <SendWarning report={report} afterSubmit={onClose}/>) : report?.actions_taken === "Suspension" ? (
                    <Suspension ref={childRef} report={report}
                                afterSubmit={onClose}/>) : (report?.actions_taken === "Termination" && (
                        <Termination ref={childRef} report={report} afterSubmit={onClose}/>))}
        </QuickModal>);
}

export default PerformDisciplinary;

const SendWarning = forwardRef<{ childFunction: () => void }, // Ref type
    { report: IncidentReport; afterSubmit: () => void } // Props type
>(({report, afterSubmit}, ref) => {
    const formSchema = z.object({message: z.string().min(10, "Message must be longer")});
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), defaultValues: {
            message: `
                I hope you're doing well. I wanted to bring to your attention an incident that occurred on ${toGMT8(report.occurance_date).format("MMMM DD, YYYY")} at ${report.location}, where it was reported that you were involved in ${report.type}.\n\nThis is a reminder that such actions are not in line with our workplace policies and expectations. I encourage you to avoid repeating this incident moving forward.\n\nThank you for your attention to this matter.`.trim(),
        },
    });
    const onsubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        const result = await showDialog({
            title: "Warning", message: "Confirm to send warning to this employee",
        });
        if (result != "yes") return;
        try {
            // employee_id, initiated_by, start_date, reason, incident_id
            await axios.post("/api/admin/incident/written", {
                ...values, employee_id: report.employee_id, incident_id: report.id,
            });
            toast({
                title: "Email sent successfully", variant: "success",
            });
            afterSubmit(); // Call the afterSubmit prop
        } catch (error) {
            toast({
                title: String(error), variant: "danger",
            });
        }
    }, [report]);

    const childFunction = async () => {
        await form.handleSubmit(onsubmit)();
    };
    useImperativeHandle(ref, () => ({
        childFunction,
    }));
    return (<Form {...form}>
            <p className="text-sm">
                <span className="font-semibold">To: </span>
                {report.trans_employees_dim_incident_reports_employee_idTotrans_employees.email}
            </p>
            <form id="incident-form" className="space-y-4">
                <FormFields<z.infer<typeof formSchema>>
                    items={[{
                        name: "message", label: "Message", type: "text-area", placeholder: "Enter message here",
                    },]}
                />
            </form>
        </Form>);
});

// defaultValues: {
//     message: `
//         I hope this message finds you well. I am writing to formally address an incident that occurred on ${toGMT8(
//             report.occurance_date
//         ).format("MMMM DD, YYYY")} at ${report.location}, where it was reported that you were involved in ${
//         report.type
//     }.\n\nThis incident is a serious matter as it involves damage to company property, which is a violation of our workplace policies and code of conduct. Such actions not only result in unnecessary costs for the organization but also disrupt the work environment and set a poor example for your colleagues.\n\nWe take these matters very seriously, and this email serves as an official warning. Please consider this a reminder to exercise greater care and responsibility in the future. Any further incidents of this nature may result in more severe disciplinary action, up to and including termination of employment.`.trim(),
// },

// const WrittenWarning = forwardRef<
//     { childFunction: () => void }, // Ref type
//     { report: IncidentReport; afterSubmit: () => void } // Props type
// >(({ report, afterSubmit }, ref) => {
//     const userID = useEmployeeId();
//     const formSchema = z.object({ date: z.string(), time: z.string() });
//     const form = useForm<z.infer<typeof formSchema>>({
//         resolver: zodResolver(formSchema),
//         defaultValues: { date: today.toISOString(), time: today.toISOString() },
//     });
//     const onsubmit = useCallback(
//         async (values: z.infer<typeof formSchema>) => {
//             const result = await showDialog({
//                 title: "Written Warning",
//                 message: "Confirm to send an appointment to this employee",
//             });
//             if (result != "yes") return;
//             try {
//                 // employee_id, initiated_by, start_date, reason, incident_id
//                 await axios.post("/api/admin/incident/terminate", {
//                     ...values,
//                     employee_id: report.employee_id,
//                     incident_id: report.id,
//                 });
//                 toast({
//                     title: "Employee terminated successfully",
//                     variant: "default",
//                 });
//                 afterSubmit(); // Call the afterSubmit prop
//             } catch (error) {
//                 toast({
//                     title: String(error),
//                     variant: "danger",
//                 });
//             }
//         },
//         [userID, report]
//     );
//     const childFunction = async () => {
//         await form.handleSubmit(onsubmit)();
//     };
//     useImperativeHandle(ref, () => ({
//         childFunction,
//     }));
//     return (
//         <Form {...form}>
//             <form id="incident-form" className="space-y-4">
//                 <FormFields<z.infer<typeof formSchema>>
//                     items={[
//                         {
//                             name: "date",
//                             label: "Date",
//                             type: "date-picker",
//                             config: {
//                                 minValue: parseAbsoluteToLocal(today.toISOString()),
//                             },
//                         },
//                         {
//                             name: "date",
//                             label: "Time",
//                             type: "time-input",
//                         },
//                     ]}
//                 />
//             </form>
//         </Form>
//     );
// });
// function Demotion({ report, afterSubmit }: { report: IncidentReport; afterSubmit: () => void }) {
//     return <div>{JSON.stringify(report)}</div>;
// }

SendWarning.displayName = "SendWarning";
const Deduction = forwardRef<{ childFunction: () => void }, // Ref type
    { report: IncidentReport; afterSubmit: () => void } // Props type
>(({report, afterSubmit}, ref) => {
    const formSchema = z.object({amount: z.number().min(1, "Amount is required")});
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), defaultValues: {amount: 0},
    });
    const onsubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        const result = await showDialog({
            title: "Deduct Payroll",
            message: "Are you sure to deduct the payroll from this employee?",
            preferredAnswer: "no",
        });
        if (result != "yes") return;
        try {
            // employee_id, initiated_by, start_date, reason, incident_id
            await axios.post("/api/admin/incident/deduct", {
                ...values, employee_id: report.employee_id, incident_id: report.id,
            });
            toast({
                title: "Payroll deducted successfully", variant: "default",
            });
            afterSubmit(); // Call the afterSubmit prop
        } catch (error) {
            toast({
                title: String(error), variant: "danger",
            });
        }
    }, [report]);

    const childFunction = async () => {
        await form.handleSubmit(onsubmit)();
    };
    useImperativeHandle(ref, () => ({
        childFunction,
    }));
    return (<Form {...form}>
            <form id="incident-form" className="space-y-4">
                <FormFields<z.infer<typeof formSchema>>
                    items={[{
                        name: "amount", label: "Enter Amount", type: "number",
                    },]}
                />
            </form>
        </Form>);
});

Deduction.displayName = "Deduction";
const Suspension = forwardRef<{ childFunction: () => void }, // Ref type
    { report: IncidentReport; afterSubmit: () => void } // Props type
>(({report, afterSubmit}, ref) => {
    const userID = useEmployeeId();
    const formSchema = z.object({start_date: z.string(), end_date: z.string()});
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {start_date: today.toISOString(), end_date: today.add(3, "days").toISOString()},
    });
    const onsubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        const result = await showDialog({
            title: "Suspend Employee", message: "Are you sure to suspend this employee?", preferredAnswer: "no",
        });
        if (result != "yes") return;
        try {
            // employee_id, initiated_by, start_date, reason, incident_id
            await axios.post("/api/admin/incident/suspend", {
                ...values,
                initiated_by: userID,
                employee_id: report.employee_id,
                incident_id: report.id,
                reason: report.description,
            });
            toast({
                title: "Employee suspended successfully", variant: "default",
            });
            afterSubmit(); // Call the afterSubmit prop
        } catch (error) {
            toast({
                title: String(error), variant: "danger",
            });
        }
    }, [userID, report]);
    const childFunction = async () => {
        await form.handleSubmit(onsubmit)();
    };
    useImperativeHandle(ref, () => ({
        childFunction,
    }));
    return (<Form {...form}>
            <form id="incident-form" className="space-y-4">
                <FormFields<z.infer<typeof formSchema>>
                    items={[{
                        name: "start_date", label: "Start Date", type: "date-picker", config: {
                            minValue: parseAbsoluteToLocal(today.toISOString()),
                        },
                    }, {
                        name: "end_date", label: "End Date", type: "date-picker", config: {
                            minValue: parseAbsoluteToLocal(today.toISOString()),
                        },
                    },]}
                />
            </form>
        </Form>);
});

Suspension.displayName = "Suspension";
const Termination = forwardRef<{ childFunction: () => void }, // Ref type
    { report: IncidentReport; afterSubmit: () => void } // Props type
>(({report, afterSubmit}, ref) => {
    const userID = useEmployeeId();
    const formSchema = z.object({start_date: z.string()});
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), defaultValues: {start_date: today.toISOString()},
    });
    const onsubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        const result = await showDialog({
            title: "Terminate Employee", message: "Are you sure to terminate this employee?", preferredAnswer: "no",
        });
        if (result != "yes") return;
        try {
            // employee_id, initiated_by, start_date, reason, incident_id
            await axios.post("/api/admin/incident/terminate", {
                ...values,
                initiated_by: userID,
                employee_id: report.employee_id,
                incident_id: report.id,
                reason: report.description,
            });
            toast({
                title: "Employee terminated successfully", variant: "default",
            });
            afterSubmit(); // Call the afterSubmit prop
        } catch (error) {
            toast({
                title: String(error), variant: "danger",
            });

        }
    }, [userID, report]);
    Termination.displayName = "Termination";
    const childFunction = async () => {
        await form.handleSubmit(onsubmit)();
    };
    useImperativeHandle(ref, () => ({
        childFunction,
    }));
    return (<Form {...form}>
            <form id="incident-form" className="space-y-4">
                <FormFields<z.infer<typeof formSchema>>
                    items={[{
                        name: "start_date", label: "Start Date", type: "date-picker", config: {
                            minValue: parseAbsoluteToLocal(today.toISOString()),
                        },
                    },]}
                />
            </form>
        </Form>);
});
