import {cn} from "@nextui-org/react";
import React, {ReactNode} from "react";
import {Button} from "@nextui-org/button";
import {LuPencil, LuTrash2, LuX} from "react-icons/lu";
import {icon_color, icon_size_sm} from "@/lib/utils";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {Section} from "@/components/common/typography/Typography";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";

interface CardViewProps {
    title?: string;
    header: ReactNode;
    body: ReactNode;
    footer: ReactNode;
    onDelete?: () => void;
    onEdit?: () => void;
    onClose?: () => void
    id?: string
}

function CardView({header, body, footer, onDelete, onEdit, onClose, title, id}: CardViewProps) {
    return (<div className="w-[700px] space-y-4 rounded border border-default-400/20 overflow-hidden" id={id}>
        <ScrollShadow size={20} className="h-full overflow-y-auto p-4">
            <div
                className="flex justify-between sticky top-0 bg-[#FAFAFA] z-10 px-4 py-2 border-b border-default-400/50">
                {header}
                {onClose && <Button onClick={onClose} isIconOnly variant="light" size="sm">
                    <LuX className={cn(icon_size_sm, icon_color)}/>
                </Button>}
            </div>
            <div className="m-4">

                <div className="h-fit">
                    {body}
                </div>
                <hr className="border border-default-400/50"/>
                {footer}
                <Section className="ms-0 mt-4" title="Danger Zone"
                         subtitle="Proceed with caution – irreversible actions ahead."/>
                {(onEdit || onDelete) && <div className="border rounded border-destructive/20 mt-4 space-y-4 p-4">
                    {onEdit && <>
                        <div className="ms-2">
                            <Section className="ms-0"
                                     title={`Edit ${title}`}
                                     subtitle={`Update or modify ${title?.toLowerCase()} details`}>
                                <Button {...uniformStyle({
                                    size: "sm", color: "default"
                                })}
                                        onClick={onEdit}
                                        startContent={<LuPencil/>}>
                                    Edit
                                </Button>
                            </Section>
                        </div>
                        <hr className="border border-destructive/20"/>
                    </>}
                    {onDelete && <div className="ms-2">
                        <Section className="ms-0" title={`Delete ${title}`}
                                 subtitle="This action cannot be undone. Proceed with caution.">
                            <Button {...uniformStyle({color: "danger"})}
                                    onClick={onDelete}
                                    startContent={<LuTrash2/>}>Delete</Button></Section>

                    </div>}
                </div>}
            </div>
        </ScrollShadow>
    </div>);
}

export default CardView;
