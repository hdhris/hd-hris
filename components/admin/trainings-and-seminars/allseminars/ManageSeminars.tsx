"use client";
import CardForm from "@/components/common/forms/CardForm";
import FormFields from "@/components/common/forms/FormFields";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery } from "@/services/queries";
import UserMail from "@/components/common/avatar/user-info-mail";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import SearchFilter from "@/components/common/filter/SearchFilter";
import { useRouter } from "next/navigation";
import { Spinner, cn } from "@nextui-org/react";
import EmployeeListForm from "@/components/common/forms/employee-list-autocomplete/EmployeeListForm";


type EmployeeInclude = {
    id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    suffix?: string;
    email?: string;
    picture?: string;
    ref_departments?: {
        id: number;
        name: string;
    };
    ref_job_classes?: {
        id: number;
        name: string;
    };
};

type SeminarData = {
    id?: number;
    name: string;
    description: string;
    location: string;
    hour_duration: number;
    start_date: string;
    end_date: string;
    // employee_instructor_id: number;
    instructor_name: string;
    is_active: boolean;
    type: string;
    max_participants: number;
    dim_training_participants?: {
        employee_id: number;
        status: string;
    }[];
};

interface SeminarResponse {
    seminar?: SeminarData;
    employees: EmployeeInclude[];
}

const formSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(3, { message: "Name must be at least 3 characters." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    hour_duration: z.number().min(1, { message: "Duration must be at least 1 hour." }),
    location: z.string().min(3, { message: "Location must be at least 3 characters." }),
    start_date: z.string(),
    end_date: z.string(),
    // employee_instructor_id: z.number().min(1, { message: "Please select an instructor" }),
    instructor_name: z
    .string()
    .regex(/^[a-zA-Z\s]*$/, "The trainer name should be in proper name")
    .optional(),
    max_participants: z.number().min(1, { message: "Maximum participants must be at least 1." }),
    is_active: z.boolean(),
    type: z.string().default('seminars'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ManageSeminars({ seminar_id }: { seminar_id?: string }) {
    const router = useRouter();
    const { data: seminarData, isLoading } = useQuery<SeminarResponse>(
        `/api/admin/trainings-and-seminars/allseminars/read?id=${seminar_id}`
    );

    const [selectedAttendees, setSelectedParticipants] = useState<number[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<EmployeeInclude[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: undefined,
            name: "",
            description: "",
            hour_duration: 1,
            location: "",
            start_date: new Date().toISOString().split("T")[0],
            end_date: new Date().toISOString().split("T")[0],
            instructor_name: "",
            max_participants: 10,
            is_active: true,
            type: 'seminars'
        }
    });

    
    useEffect(() => {
        if (seminarData?.seminar) {
            const { dim_training_participants, ...seminarValues } = seminarData.seminar;
            form.reset(seminarValues as FormValues);
            console.log("Resetting form with values:", seminarValues);

        }
    }, [seminarData?.seminar, form]);
    

    useEffect(() => {
        if (seminarData?.employees) {
            setFilteredEmployees(seminarData.employees);
        }
    }, [seminarData?.employees]);

    useEffect(() => {
        if (seminarData?.seminar?.dim_training_participants) {
            const participants = seminarData.seminar.dim_training_participants;
            if (participants.length > 0) {
                setSelectedParticipants(participants.map((p) => p.employee_id));
            }
        }
    }, [seminarData?.seminar]);

    function selectParticipant(id: number) {
        setSelectedParticipants((prev) => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                if (updated.size < form.watch("max_participants")) {
                    updated.add(id);
                } else {
                    toast({
                        title: "Maximum participants reached",
                        variant: "warning",
                    });
                }
            }
            return [...updated];
        });
    }

    const handleSubmit = useCallback(
        async (values: FormValues) => {
            try {
                const startDate = new Date(values.start_date);
                const endDate = new Date(values.end_date);
                
                if (endDate < startDate) {
                    toast({
                        title: "End date cannot be before start date",
                        variant: "warning",
                    });
                    return;
                }

                if (selectedAttendees.length === 0) {
                    toast({
                        title: "Please select at least one participant",
                        variant: "warning",
                    });
                    return;
                }

                const response = await axios.post(
                    "/api/admin/trainings-and-seminars/allseminars/upsert",
                    {
                        data: values,
                        participants: selectedAttendees,
                    }
                );

                const id = response.data?.id;
                if (id) {
                    toast({
                        title: `Seminar ${seminarData?.seminar ? "updated" : "created"} successfully`,
                        variant: "success",
                    });
                    router.push("/trainings-and-seminars/allseminars");
                } else {
                    throw new Error("Invalid returned ID");
                }
            } catch (error) {
                toast({ title: `${error}`, variant: "danger" });
            }
        },
        [selectedAttendees, seminarData, router]
    );

    if (isLoading) {
        return <Spinner label="Loading..." className="flex-1" />;
    }

    // const instructorId = form.watch('employee_instructor_id');

    return (
        <div className="h-full w-full flex gap-2">
            <CardForm
                label={`${seminarData?.seminar ? "Update" : "Create"} Seminar`}
                form={form}
                onSubmit={handleSubmit}
                className="w-fit"
                classNames={{ body: { form: "space-y-4" } }}
            >
                <FormFields
                    items={[
                        {
                            name: "name",
                            label: "Seminar Name",
                            isRequired: true,
                            placeholder:"Enter Seminar name (e.g., leadership seminars)",
                            
                        },
                        {
                            name: "description",
                            label: "Description",
                            type: "text-area",
                            placeholder: "Enter a detailed seminar description (e.g., A workshop focused on improving leadership skills and team collaboration).",
                            isRequired: true,
                        },
                        {
                            name: "location",
                            label: "Location",
                            isRequired: true,
                        },
                        // {
                        //     name: "employee_instructor_id",
                        //     label: "Program Instructor",
                        //     type: "text", // Use "text" instead of "custom"
                        //     Component: (field) => (
                        //       <EmployeeListForm
                        //         employees={filteredEmployees.map(emp => ({
                        //           id: emp.id,
                        //           name: getEmpFullName(emp),
                        //           picture: emp.picture || "",
                        //           department: emp.ref_departments?.name || "",
                        //         //   is_regular: true // or any appropriate value
                        //         }))}
                        //         isLoading={isLoading}
                        //         onSelected={(employeeId) => {
                        //           field.onChange(employeeId);
                        //         }}
                        //       />
                        //     ),
                        //     isRequired: true,
                        //   },
                        {
                            name: "instructor_name",
                            label: "Presenter",
                            placeholder: "Enter presenter's name",
                            type: "text",
                            description: "Presenter's name should be valid",
                            isRequired: true,

                        },
                        {
                            name: "hour_duration",
                            label: "Duration (hours)",
                            type: "number",
                            isRequired: true,
                        },
                        {
                            name: "start_date",
                            label: "Start Date",
                            type: "date-picker",
                            isRequired: true,
                        },
                        {
                            name: "end_date",
                            label: "End Date",
                            type: "date-picker",
                            isRequired: true,
                        },
                        {
                            name: "max_participants",
                            label: "Maximum Attendees",
                            type: "number",
                            isRequired: true,
                        },
                        {
                            name: "is_active",
                            type: "switch",
                            label: "Active",
                        },
                    ]}
                />
            </CardForm>
            <div className="w-full h-full overflow-auto">
                <div className="sticky top-0 left-0 bg-gray-50 z-10 pb-4 shadow-md flex justify-between">
                    <SearchFilter
                        items={seminarData?.employees || []}
                        setResults={setFilteredEmployees}
                        className="w-80"
                        searchConfig={[
                            {
                                key: "first_name",
                                label: "",
                            },
                            {
                                key: "middle_name",
                                label: "",
                            },
                            {
                                key: "last_name",
                                label: "Name",
                            },
                            {
                                key: "email",
                                label: "Email",
                            },
                        ]}
                    />
                    <p className="text-gray-500 font-semibold text-small">
                        {selectedAttendees.length} attendees selected
                    </p>
                </div>
                {filteredEmployees.length === 0 && (
                    <p className="text-gray-500 text-center p-4">No employees found</p>
                )}
                <div className="min-w-[750px] space-y-1 h-fit">
                    {filteredEmployees
                        // .filter(emp => emp.id !== instructorId)
                        .map((item: EmployeeInclude) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "p-4 border-2 cursor-pointer",
                                    selectedAttendees.includes(item.id)
                                        ? "border-blue-500"
                                        : "border-gray-50"
                                )}
                                onClick={() => selectParticipant(item.id)}
                            >
                                <div className="flex flex-row gap-4">
                                    <div className="flex-1">
                                        <UserMail
                                            name={getEmpFullName(item)}
                                            picture={item.picture || ""}
                                            email={item.email || ""}
                                        />
                                    </div>
                                    <div className="w-48 text-small">
                                        <p>
                                            {item.ref_job_classes ? item.ref_job_classes.name : "None"}
                                        </p>
                                        <p className="text-gray-500">
                                            {item.ref_departments ? item.ref_departments.name : "None"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}