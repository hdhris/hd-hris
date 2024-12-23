import {z} from "zod";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ScrollShadow,
    useDisclosure
} from "@nextui-org/react";
import {useSignatoryRoles} from "@/services/queries";
import {useToast} from "@/components/ui/use-toast";
import React, {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {axiosInstance} from "@/services/fetcher";
import {AxiosError} from "axios";
import {capitalize} from "@nextui-org/shared-utils";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {Form} from "@/components/ui/form";
import FormFields from "@/components/common/forms/FormFields";
import {Section} from "@/components/common/typography/Typography";
import CardTable from "@/components/common/card-view/card-table";
import {LuPencil, LuTrash2} from "react-icons/lu";

const signatoryRoleSchema = z.object({
    role: z.string().min(1, {message: "Field is required."})
})

export default function SignatoryForm() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const {data, mutate} = useSignatoryRoles()
    const {toast} = useToast()
    const [loading, setLoading] = useState<boolean>(false)
    const [editId, setEditId] = useState<number | undefined>(undefined)
    const form = useForm<z.infer<typeof signatoryRoleSchema>>({
        resolver: zodResolver(signatoryRoleSchema), defaultValues: {
            role: ""
        }
    })

    const signatoryRoles = useMemo(() => {
        if (data) {
            return data
        }
        return []
    }, [data]);

    const handleOnSubmit = async (data: z.infer<typeof signatoryRoleSchema>) => {
        setLoading(true)
        try {
            const values = {
                id: editId,
                role: data.role,
            };

            const res = await axiosInstance.post("/api/admin/signatory/roles/upsert", values);

            if(res.status === 200){
                toast({
                    title: "Success",
                    description: `${editId ? "Updated" : "Added"} role successfully.`,
                    variant: "success"
                })
                form.reset({role: ""})
                setEditId(undefined)
                await mutate()
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



    const handleActions = async (id: number, action: "edit" | "delete") => {
        if (action === "edit") {
            form.reset({
                role: capitalize(signatoryRoles.find(item => item.id === id)?.signatory_role_name || "")
            })
            setEditId(id)
        }else{
            try {
                const res = await axiosInstance.post("/api/admin/signatory/roles/delete", {id});
                if(res.status === 200){
                    toast({
                        title: "Success",
                        description: "Delete role successfully.",
                        variant: "success"
                    })
                    form.reset({role: ""})
                    setEditId(undefined)
                    await mutate()
                }
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

        }
    }
    return (<>
        <Button {...uniformStyle()} onClick={onOpen}>
            Add Signatory Role
        </Button>
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} isDismissable={false}>
            <ModalContent>
                {(onClose) => (<>
                    <ModalHeader className="flex flex-col gap-1">Add Signatory Role</ModalHeader>
                    <ModalBody>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleOnSubmit)} className="w-full">
                                <FormFields items={[{
                                    name: "role",
                                    label: "Signatory Role",
                                    "description": "Specifies the role of the person authorized to sign."
                                }]}/>
                                <div className="w-full flex justify-end mt-2 gap-2">
                                    {editId && <Button {...uniformStyle({color: "default", variant:"bordered"})} //Fixed: 'variant' is specified more than once, so this usage will be overwritten.
                                                       onClick={() => {
                                        setEditId(undefined)
                                        form.reset({role: ""})
                                    }}>
                                        Clear
                                    </Button>}
                                    <Button isLoading={loading} type="submit" {...uniformStyle()}>
                                        {editId ? "Update" : "Add"}
                                    </Button>
                                </div>
                            </form>
                        </Form>

                        <div className="mt-2">
                            <Section className="ms-0" title="Signatory Roles"
                                     subtitle="Responsibilities and permissions assigned to each signatory in the process."/>

                            <ScrollShadow className="max-h-52">
                                <CardTable data={signatoryRoles.map(item => ({
                                    label: capitalize(item.signatory_role_name), value: (<div>
                                        <Button isIconOnly {...uniformStyle({variant: "light"})} //Fixed: 'variant' is specified more than once, so this usage will be overwritten.
                                                onClick={() => handleActions(item.id, "edit")}>
                                            <LuPencil/>
                                        </Button>
                                        <Button isIconOnly {...uniformStyle({color: "danger", variant: "light"})} //Fixed: 'variant' is specified more than once, so this usage will be overwritten.
                                                onClick={() => handleActions(item.id, "delete")}>
                                            <LuTrash2/>
                                        </Button>
                                    </div>)
                                }))}/>
                            </ScrollShadow>

                        </div>

                    </ModalBody>
                    <ModalFooter>
                        <Button {...uniformStyle({color: "danger", variant: "light"})} //Fixed: 'variant' is specified more than once, so this usage will be overwritten.
                                 onPress={onClose}>
                            Close
                        </Button>
                        <Button {...uniformStyle()} onPress={onClose}>
                            Ok
                        </Button>
                    </ModalFooter>
                </>)}
            </ModalContent>
        </Modal>
    </>);
}
