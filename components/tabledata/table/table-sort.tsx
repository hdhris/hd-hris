import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import { LuArrowDownUp } from "react-icons/lu";
import {
    cn,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Selection, SortDescriptor,
} from "@nextui-org/react";
import { icon_size_sm } from "@/lib/utils";
import { capitalize } from "@nextui-org/shared-utils";
import {Key} from "@react-types/shared";

interface SortedItemProps<T>{
    key: string;
    name: string;
}

interface SortProps<T>{
    sortItems: SortedItemProps<T>[];
    initialValue?: Key;
    onSortChange: (keys: SortDescriptor) => void;
}

function TableSort<T>({ sortItems, initialValue, onSortChange }: SortProps<T>) {
    const [sort, setSort] = useState<Selection>(initialValue ? new Set([initialValue]) : new Set([]));

    const handleSelectionChange = (keys: Selection) => {
        const selectedKey = Array.from(keys).pop() as string


        const sortDescriptor: SortDescriptor = {
            column: selectedKey, direction: "ascending",
        };
        onSortChange(sortDescriptor);
        setSort(keys);
    };

    return (
        <div className="flex gap-3 items-center">
            <Dropdown>
                <DropdownTrigger className="hidden sm:flex">
                    <Button
                        size="sm"
                        radius="md"
                        color="primary"
                        startContent={
                            <LuArrowDownUp className={cn("text-slate-700", icon_size_sm)} />
                        }
                        variant="bordered"
                    >
                        Sort
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="Sort Items"
                    className="max-h-96 overflow-y-auto"
                    closeOnSelect={false}
                    selectedKeys={sort}
                    selectionMode="single"
                    onSelectionChange={handleSelectionChange}
                >
                    <DropdownSection>
                        {sortItems.map((item) => (
                            <DropdownItem
                                key={`${item.key}`}
                                className="capitalize"
                            >
                                {capitalize(item.name)}
                            </DropdownItem>
                        ))}
                    </DropdownSection>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}

export default TableSort;
