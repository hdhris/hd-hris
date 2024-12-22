import showDialog from "@/lib/utils/confirmDialog";
import Drawer from "@/components/common/Drawer";
import PrivilegesList from "./tree";
import { UserPrivileges } from "@/types/JSON/user-privileges";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import React, { useCallback, useState } from "react";
import { ModuleNamesArray, static_privilege } from "@/types/privilege/privilege";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import FormFields from "@/components/common/forms/FormFields";

interface ViewPrivilegeProps {
    mutate: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const formSchema = z.object({
    name: z.string().min(1, "Privilege name is required"),
    accessibility: z.object({
        web_access: z.boolean(),
        modules: z.array(
            z.object({
                name: z.enum(ModuleNamesArray),
                privileges: z.array(
                    z.object({
                        name: z.string(),
                        paths: z.array(z.string()),
                    })
                ),
            })
        ),
    }),
});

function FilePrivilege({ isOpen, mutate, onClose }: ViewPrivilegeProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            accessibility: {
                web_access: true,
                modules: [],
            },
        },
    });

    const reset = () => {
        form.reset({
            name: "",
            accessibility: {
                web_access: true,
                modules: [],
            },
        });
    };

    const onSubmit = useCallback(
        async (values: z.infer<typeof formSchema>) => {
            try {
                await axios.post("/api/admin/privilege/create-accessibility", values);
                toast({
                    title: "Accessibility created successfully",
                    variant: "success",
                });

                onClose();
                mutate();
            } catch (error) {
                console.log(error);
                toast({
                    title: "An error has occured",
                    variant: "danger",
                });
            }
        },
        [form, onClose, mutate]
    );

    return (
        <Drawer
            isOpen={isOpen}
            onClose={() => {
                onClose();
                reset();
            }}
            title="Create New Privilege"
        >
            <div className="space-y-4">
                <Form {...form}>
                    <form id="drawer-form" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormFields
                            items={[
                                {
                                    name: "name",
                                    label: "Name",
                                    isRequired: true,
                                },
                            ]}
                        />
                    </form>
                </Form>
                <PrivilegesList
                    accessibility={form.watch("accessibility")}
                    setAccessibility={(value) => form.setValue("accessibility", value)}
                />
            </div>
        </Drawer>
    );
}

export default FilePrivilege;
