import {z} from "zod";
import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";
import {useJobTypes, useSignatoryRoles} from "@/services/queries";
import {useToast} from "@/components/ui/use-toast";
import React, {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {capitalize} from "@nextui-org/shared-utils";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {Form} from "@/components/ui/form";
import FormFields from "@/components/common/forms/FormFields";
import {LuPlus} from "react-icons/lu";
import {icon_size_sm} from "@/lib/utils";
import {JobTypes} from "@/types/signatory/job/job-types";
import {SignatoryRoles} from "@/types/signatory/signatory-types";
import {axiosInstance} from "@/services/fetcher";
import { AxiosError } from "axios";
import {useSWRConfig} from "swr";

const signatories = z.object({
    job: z.string().min(1, {message: "Field is required."}),
    is_apply_to_all_signatories: z.boolean().default(false),
    role: z.string().min(1, {message: "Field is required."}),
})

interface AddJobRoleFormProps {
    id: number
    name: string
    existingJobs: JobTypes[]
    existingRoles: SignatoryRoles[],
}

export default function AddJobRoleForm({id, name, existingJobs, existingRoles}: AddJobRoleFormProps) {
    const { mutate } = useSWRConfig()
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const [loading, setLoading] = useState<boolean>(false)
    const {data: job_types} = useJobTypes()
    const {data: signatory_roles} = useSignatoryRoles()
    const {toast} = useToast()
    const form = useForm<z.infer<typeof signatories>>({
        resolver: zodResolver(signatories), defaultValues: {
            job: "", role: "", is_apply_to_all_signatories: false
        }
    })

    const jobTypes = useMemo(() => {
        if (job_types) {
            // console.log("Job: ", job_types.filter(item => item.id !== existingJobs.id))
            return job_types.filter(item => existingJobs.every(job => job.id !== item.id))
        }
        return []
    }, [existingJobs, job_types]);

    const roleTypes = useMemo(() => {
        if (signatory_roles) {
            return signatory_roles
        }
        return []
    }, [existingRoles, signatory_roles]);

    const handleOnSubmit = async (data: z.infer<typeof signatories>) => {
        const values = {
            id,
            ...data

        }
        // alert("Data: " + JSON.stringify(values))
        setLoading(true)
        try {

            const res = await axiosInstance.post("/api/admin/signatory/create", values);

            if(res.status === 200){
                toast({
                    title: "Success",
                    description: `Added role successfully.`,
                    variant: "success"
                })
                form.reset()
                // setEditId(undefined)
                onClose()
                await mutate("/api/admin/signatory")
            }
            // Handle the successful response (e.g., show a success message, navigate, etc.)
        } catch (error) {
            console.log("Error: ", error)
            // Handle errors (e.g., log the error, show an error message, etc.)
            if (error instanceof AxiosError) {
                toast({
                    title: "Error",
                    description: error.response?.data.message,
                    variant: "danger"
                })
            } else {
                toast({
                    title: "Error",
                    description: "Unexpected Error.",
                    variant: "danger"
                })
            }
        }

        setLoading(false)
    };


    // const handleActions = async (id: number, action: "edit" | "delete") => {
    //     if (action === "edit") {
    //         form.reset({
    //             role: capitalize(signatoryRoles.find(item => item.id === id)?.signatory_role_name || "")
    //         })
    //         setEditId(id)
    //     }else{
    //         try {
    //             const res = await axiosInstance.post("/api/admin/signatory/roles/delete", {id});
    //             if(res.status === 200){
    //                 toast({
    //                     title: "Success",
    //                     description: "Delete role successfully.",
    //                     variant: "success"
    //                 })
    //                 form.reset({role: ""})
    //                 setEditId(undefined)
    //                 await mutate()
    //             }
    //         } catch (error) {
    //             console.log("Error: ", error)
    //             // Handle errors (e.g., log the error, show an error message, etc.)
    //             if (error instanceof AxiosError) {
    //                 toast({
    //                     title: "Error",
    //                     description: error.response?.data.message,
    //                     variant: "danger"
    //                 })
    //             } else {
    //                 toast({
    //                     title: "Error",
    //                     description: "Unexpected Error.",
    //                     variant: "danger"
    //                 })
    //             }
    //         }
    //
    //     }
    // }
    // <Button isLoading={loading} type="submit" {...uniformStyle()}>
    //     Add
    // </Button>
    return (<>
        <Button {...uniformStyle({variant: "light"})} //Fixed: 'variant' is specified more than once, so this usage will be overwritten.
                isIconOnly onClick={onOpen}><LuPlus
            className={icon_size_sm}/></Button>
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} isDismissable={false}>
            <ModalContent>
                {(onClose) => (<>
                    <ModalHeader className="flex flex-col gap-1">Add Signatory For {name}</ModalHeader>
                    <ModalBody>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleOnSubmit)} className="w-full space-y-4" id="add-signatory">
                                <FormFields items={[{
                                    name: "job",
                                    label: "Select Job Class",
                                    type: "auto-complete",
                                    description: "Select the job that authorized to sign.",
                                    config: {
                                        options: jobTypes.map(item => ({
                                            value: String(item.id), label: capitalize(item.name)
                                        }))
                                    }
                                }, {
                                    name: "role",
                                    label: "Select Signatory Role",
                                    type: "auto-complete",
                                    description: "Select the role type.",
                                    config: {
                                        options: roleTypes.map(item => ({
                                            value: String(item.id), label: capitalize(item.signatory_role_name)
                                        }))
                                    }
                                }, {
                                    name: "is_apply_to_all_signatories", // Reflects the flag for universal signatories
                                    label: "Universal Signatory", // Clear label
                                    type: "switch", // Switch toggle type for true/false
                                    description: "Toggle to make the signatory role apply universally to all employees, regardless of department.", // More specific description
                                    config: {
                                        options: roleTypes.map(item => ({
                                            value: String(item.id), // Convert the id to string for consistency
                                            label: capitalize(item.signatory_role_name) // Capitalize the role name for display
                                        }))
                                    }

                                },]}/>
                            </form>
                        </Form>

                        {/*<div className="mt-2">*/}
                        {/*    <Section className="ms-0" title="Signatory Roles"*/}
                        {/*             subtitle="Responsibilities and permissions assigned to each signatory in the process."/>*/}

                        {/*    /!*<ScrollShadow className="max-h-52">*!/*/}
                        {/*    /!*    <CardTable data={signatoryRoles.map(item => ({*!/*/}
                        {/*    /!*        label: capitalize(item.signatory_role_name), value: (<div>*!/*/}
                        {/*    /!*            <Button isIconOnly {...uniformStyle()} variant="light"*!/*/}
                        {/*    /!*                    onClick={() => handleActions(item.id, "edit")}>*!/*/}
                        {/*    /!*                <LuPencil/>*!/*/}
                        {/*    /!*            </Button>*!/*/}
                        {/*    /!*            <Button isIconOnly {...uniformStyle({color: "danger"})} variant="light"*!/*/}
                        {/*    /!*                    onClick={() => handleActions(item.id, "delete")}>*!/*/}
                        {/*    /!*                <LuTrash2/>*!/*/}
                        {/*    /!*            </Button>*!/*/}
                        {/*    /!*        </div>)*!/*/}
                        {/*    /!*    }))}/>*!/*/}
                        {/*    /!*</ScrollShadow>*!/*/}

                        {/*</div>*/}

                    </ModalBody>
                    <ModalFooter>
                        <Button {...uniformStyle({color: "danger", variant: "light"})} //Fixed: 'variant' is specified more than once, so this usage will be overwritten.
                                onPress={onClose}>
                            Close
                        </Button>
                        <Button isLoading={loading} {...uniformStyle()} type="submit" form="add-signatory">
                            Add
                        </Button>
                    </ModalFooter>
                </>)}
            </ModalContent>
        </Modal>
    </>);
}
