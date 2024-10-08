"use client"
import React from 'react';
import {cn} from "@nextui-org/react";
import ActionControlDropdown from "@/components/common/action-controls/ActionControlDropdown";
import {Key} from "@react-types/shared";
import Pulse from "@/components/common/effects/Pulse";
import Typography from "@/components/common/typography/Typography";
import uniqolor from "uniqolor";
import {useToast} from "@/components/ui/use-toast";
import {useFormTable} from "@/components/providers/FormTableProvider";
import {LeaveTypesKey} from "@/types/leaves/LeaveTypes";

interface HeaderProps {
    name: string;
    is_active: boolean;
    id: React.Key;
}
function Header({id, name , is_active}: HeaderProps) {
    const {toast} = useToast()
    const {setFormData} = useFormTable<LeaveTypesKey>()
    const bgGradient = (name: string) => {
        return {
            style: {
                background: uniqolor(name).color
            }
        }
    }
    const isLight = uniqolor(name).isLight;

    const handleDelete = (key: React.Key) => {
        setFormData({
            methods: "Delete",
            data: {
                key,
            }
        })
    }

    const handleEdit = (key: Key) => {
        setFormData({
            methods: "Edit",
            data: {
                key,
            }
        })
    }
    return (
        <div {...bgGradient(name)}
             className={cn("relative flex w-full h-28 rounded-b-sm rounded-r-sm", !isLight ? "shadow-[inset_-1px_-121px_75px_-52px_rgba(0,0,0,0.49)]" : "shadow-[inset_-1px_-121px_75px_-52px_rgba(255,255,255,0.49)]")}> {/* shadow-[inset_-1px_-121px_75px_-52px_rgba(0,0,0,0.49)] */}
            {/* Name positioned bottom-left */}
            <div className="absolute top-2 right-0 pr-2">
                <ActionControlDropdown
                    className="text-default-200"
                    onDelete={handleDelete.bind(null, id as Key)}
                    onEdit={handleEdit.bind(null, id as Key)}
                />
            </div>

            <div className="flex items-end p-2 gap-4 w-full h-full">
                <Pulse color={is_active ? "success" : "danger"}/>
                <Typography
                    className={cn("w-full text-2xl font-extrabold break-words overflow-hidden text-pretty", isLight ? "text-black" : "text-white")}>
                    {name}
                </Typography>
            </div>
        </div>
    );
}

export default Header;