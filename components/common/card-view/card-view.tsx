import {ButtonProps, cn} from "@nextui-org/react";
import React, {ReactNode} from "react";
import {Button} from "@nextui-org/button";
import {LuPencil, LuTrash2, LuX} from "react-icons/lu";
import {icon_color, icon_size_sm} from "@/lib/utils";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {Section} from "@/components/common/typography/Typography";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";

interface CardViewProps {
    className?: string
    title?: string;
    header: ReactNode;
    body: ReactNode;
    footer?: ReactNode;
    onDelete?: () => void;
    onEdit?: () => void;
    editProps?: ButtonProps & {children?: ReactNode}
    deleteProps?: ButtonProps & {children?: ReactNode}
    onClose?: () => void
    onDanger?: ReactNode
    id?: string
}

function CardView({header, body, footer, onDelete, onEdit, onClose, title, id, onDanger, editProps, deleteProps, className}: CardViewProps) {
    return (<div className={cn("relative w-full space-y-4 rounded border border-default-400/20 overflow-hidden grid grid-rows-[auto_1fr] pb-6", className)} id={id}>
        <div
            className="flex justify-between sticky top-0 bg-[#FAFAFA] z-10 px-4 py-2 border-b border-default-400/50">
            {header}
            {onClose && <Button onPress={onClose} isIconOnly variant="light" size="sm">
                <LuX className={cn(icon_size_sm, icon_color)}/>
            </Button>}
        </div>
        <div className="h-full overflow-hidden">
            <ScrollShadow size={20} className="h-full overflow-y-auto py-2 px-4">
                <div className="m-2">
                    <div className="h-fit flex flex-col gap-4 mb-4">
                        {body}
                    </div>
                    <hr className="border border-default-400/50"/>
                    {footer}
                    {(onEdit || onDelete || onDanger) && <>
                        <Section className="ms-0 mt-4" title="Danger Zone"
                                 subtitle="Proceed with caution – irreversible actions ahead."/>
                        <div className="border rounded border-destructive/20 mt-4 space-y-4 p-4 w-full">
                            {onDanger}
                            {onEdit && <>
                                <div className="ms-2 space-y-2">
                                    <Section className="ms-0"
                                             title={`Edit ${title}`}
                                             subtitle={`Update or modify ${title?.toLowerCase()} details`}>
                                        <Button {...uniformStyle({
                                            size: "sm", color: "default"
                                        })} {...editProps}
                                                onPress={onEdit}
                                                startContent={<LuPencil/>}>
                                            Edit
                                        </Button>
                                    </Section>
                                    {editProps?.children && editProps?.children}
                                </div>
                            </>}
                            {onEdit && onDelete && <hr className="border border-destructive/20"/>}
                            {onDelete && <div className="ms-2 space-y-2">
                                <Section className="ms-0" title={`Delete ${title}`}
                                         subtitle="This action cannot be undone. Proceed with caution.">

                                    <Button {...uniformStyle({color: "danger"})}
                                            {...deleteProps}
                                            onPress={onDelete}
                                            startContent={<LuTrash2/>}>Delete</Button>
                                </Section>
                                {deleteProps?.children && deleteProps?.children}
                            </div>}
                        </div>
                    </>}
                </div>
            </ScrollShadow>
        </div>
    </div>);
}

export default CardView;
