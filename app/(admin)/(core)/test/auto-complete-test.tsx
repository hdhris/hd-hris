"use client";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import { Form } from "@/components/ui/form";
import { useQuery } from "@/services/queries";
import { Button, Spinner } from "@nextui-org/react";
import React, { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

function AutoCTest() {
    const [job, setJob] = useState("No Job");

    const { data, isLoading } = useQuery<
        {
            id: number;
            name: string;
        }[]
    >("/api/admin/utils/test");

    const formScheme = z.object({
        job_id: z.number(),
    });

    const form = useForm<z.infer<typeof formScheme>>({
        defaultValues: {
            job_id: 0,
        },
    });

    const onSubmit = useCallback(
        async function (values: z.infer<typeof formScheme>) {
            // console.log(values, data);
            if (data) {
                setJob(data.find((item) => item.id === Number(values.job_id))?.name || "Not found");
            }
        },
        [data]
    );

    if (!data || isLoading) {
        return <Spinner className="flex-1" color="primary" />;
    }
    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormFields
                        items={[
                            {
                                name: "job_id",
                                type: "auto-complete",
                                config: {
                                    options: data?.map((item) => {
                                        return {
                                            label: item.name,
                                            value: String(item.id),
                                        };
                                    }),
                                },
                            },
                        ]}
                    />
                    <Button type="submit" color="primary">
                        Set
                    </Button>
                </form>
            </Form>
            <h1>{job}</h1>
        </>
    );
}

export default AutoCTest;
