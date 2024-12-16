import Drawer from "@/components/common/Drawer";
import FormFields from "@/components/common/forms/FormFields";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface FileOvertimeProps {
    isOpen: boolean;
    onClose: ()=> void;
}
function FileOvertime({ isOpen, onClose }: FileOvertimeProps) {

    const formSchema = z.object({
        reason: z.string(),
        clock_in: z.string().nullable(),
        clock_out: z.string().nullable(),
        date: z.string().nullable(),
        is_auto_approved: z.boolean(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reason: "",
            clock_in: "",
            clock_out: "",
            date: "",
        },
    });
    return (
        <Drawer isOpen={isOpen} onClose={onClose} title={"File Overtime Application"}>
            <Form {...form}>
                <form>
                    <FormFields
                        items={[
                            {
                                name: "clock_in",
                                label: "Clock In",
                                type: "time"
                            },
                            {
                                name: "clock_out",
                                label: "Clock Out",
                                type: "time"
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
