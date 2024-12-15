"use client"
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
            job_id: number;
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

    const options = useMemo(() => {
        if (data) {
            return data?.map((item) => {
                return {
                    label: item.name,
                    value: String(item.job_id),
                };
            });
        }
        return [];
    }, [data]);

    const fields: FormInputProps[] = useMemo(() => {
        return [
            {
                name: "job_id",
                type: "auto-complete",
                config: {
                    options: options,
                    onValueChange: (value: React.Key) => form.setValue("job_id", Number(String(value))),
                },
            },
        ];
    }, [options]);

    const onSubmit = useCallback(
        async function (values: z.infer<typeof formScheme>) {
            console.log(values);
            if (data) {
                setJob(data.find((item) => item.job_id === values.job_id)?.name || "Not found");
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
                    <FormFields items={fields} />
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
