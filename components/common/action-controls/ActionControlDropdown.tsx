'use client'
import React from 'react';
import {Button, cn, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from "@nextui-org/react";
import {LuMoreVertical, LuPencil, LuTrash2} from "react-icons/lu";
import {icon_color, icon_size} from "@/lib/utils";

interface ActionControlDropdownProps {
    className?: string,
    onEdit: () => void,
    onDelete: () => void
}
function ActionControlDropdown({className, onEdit, onDelete}: ActionControlDropdownProps) {
    return (
        <Dropdown>
            <DropdownTrigger>
                <Button
                    variant="light"
                    isIconOnly
                    className="p-2 min-w-0 w-fit h-fit"
                >
                    <LuMoreVertical className={(cn("size-5", className))}/>
                </Button>
            </DropdownTrigger>
            <DropdownMenu variant="faded" aria-label="Dropdown menu with description">
                <DropdownSection title="Actions" showDivider>
                    <DropdownItem
                        key="edit"
                        shortcut="⌘⇧E"
                        description="Allows you to edit the leave type"
                        startContent={<LuPencil className={cn(icon_color, icon_size)}/>}
                        onClick={onEdit}
                    >
                        Edit file
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Danger zone">
                    <DropdownItem
                        onClick={onDelete}
                        key="delete"
                        className="text-danger"
                        color="danger"
                        shortcut="⌘⇧D"
                        description="Permanently delete the leave type"
                        startContent={<LuTrash2 className={cn("text-danger-500", icon_size)} />}
                    >
                        Delete file
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    );
}

export default ActionControlDropdown;