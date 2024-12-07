// components/admin/trainings-and-seminars/emprecords/ManageRecord.tsx
"use client";
import { useQuery } from "@/services/queries";
import { Button, Card, CardBody, CardHeader, Divider, Input, Select, SelectItem } from "@nextui-org/react";
import { TrainingRecord } from "../types";
import { useForm, SubmitHandler } from "react-hook-form"; // Import SubmitHandler
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    status: z.enum(["enrolled", "ongoing", "completed"]),
    feedback: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function ManageRecord({ record_id }: { record_id: string }) {
    const router = useRouter();
    const { data: record, isLoading } = useQuery<TrainingRecord>(
        `/api/trainings-and-seminars/emprecords/read?id=${record_id}`
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: (record?.status as "enrolled" | "ongoing" | "completed") || "enrolled",
            feedback: record?.feedback || ""
        }
    });

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        try {
            await axios.post("/api/trainings-and-seminars/emprecords/update", {
                id: record_id,
                ...values
            });

            toast({
                title: "Record updated successfully",
                variant: "success"
            });

            router.push("/trainings-and-seminars/emprecords");
        } catch (error) {
            toast({
                title: "Failed to update record",
                variant: "danger"
            });
        }
    };

    if (isLoading || !record) {
        return <div>Loading...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold">Update Record Status</h2>
                    <p className="text-sm text-gray-500">
                        {record.ref_training_programs.name} - {record.ref_training_programs.type}
                    </p>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Select
                            label="Status"
                            placeholder="Select status"
                            defaultSelectedKeys={[record.status]}
                            onChange={(e) => form.setValue('status', e.target.value as "enrolled" | "ongoing" | "completed")}
                            isRequired
                        >
                            <SelectItem key="enrolled">Enrolled</SelectItem>
                            <SelectItem key="ongoing">Ongoing</SelectItem>
                            <SelectItem key="completed">Completed</SelectItem>
                        </Select>
                        {form.formState.errors.status && (
                            <span className="text-red-500 text-sm">Status is required</span>
                        )}
                    </div>

                    <Input
                        label="Feedback"
                        placeholder="Enter feedback (optional)"
                        defaultValue={record.feedback || ""}
                        onChange={(e) => form.setValue('feedback', e.target.value)}
                    />

                    <div className="flex justify-end gap-2">
                        <Button 
                            color="danger" 
                            variant="light"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button color="primary" type="submit">
                            Update Record
                        </Button>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
}