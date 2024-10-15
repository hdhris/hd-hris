import React, {useEffect, useState} from "react";
import {Button} from "@nextui-org/button";
import {LuArrowDownUp} from "react-icons/lu";
import {
    cn, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Selection, SortDescriptor, Switch,
} from "@nextui-org/react";
import {icon_size_sm} from "@/lib/utils";
import {capitalize} from "@nextui-org/shared-utils";
import {Key} from "@react-types/shared";
import {BsArrowDown, BsArrowUp} from "react-icons/bs";

interface SortedItemProps<T> {
    key: string;
    name: string;
}

interface SortProps<T> {
    sortItems: SortedItemProps<T>[];
    initialValue?: Key;
    onSortChange: (keys: SortDescriptor) => void;
}

function TableSort<T>({sortItems, initialValue, onSortChange}: SortProps<T>) {
    const [sort, setSort] = useState<Selection>(initialValue ? new Set([initialValue]) : new Set([]));
    const [direction, setDirection] = useState<'ascending' | 'descending'>()

    const handleDirectionChange = (isSelected: boolean) => {
        setDirection(isSelected ? 'ascending' : 'descending')
    };

    const handleSelectionChange = (keys: Selection) => {

        setSort(keys);
    };

    useEffect(() => {
        const selectedKey = Array.from(sort).pop() as string;
        onSortChange({column: selectedKey, direction: direction});
    }, [direction, onSortChange, sort]);

    return (<div className="flex gap-3 items-center">
        <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
                <Button
                    size="sm"
                    radius="md"
                    color="primary"
                    startContent={<LuArrowDownUp className={cn("text-slate-700", icon_size_sm)}/>}
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
                disabledKeys={sort !== "all" && sort.size === 0 ? ["direction"] : []}
                selectionMode="single"
                itemClasses={{
                    base: ["rounded-md", "text-default-500", "transition-opacity", "data-[hover=true]:text-foreground", "data-[hover=true]:bg-default-100", "dark:data-[hover=true]:bg-default-50", "data-[selectable=true]:focus:bg-default-50", "data-[pressed=true]:opacity-70", "data-[focus-visible=true]:ring-default-500",],
                }}
                onSelectionChange={handleSelectionChange}
            >
                <DropdownSection
                    showDivider={sortItems.length - 1 > 0}
                >
                    {sortItems.map((item) => (<DropdownItem
                        key={`${item.key}`}
                        className="capitalize"
                    >
                        {capitalize(item.name)}
                    </DropdownItem>))}
                </DropdownSection>
                <DropdownSection>
                    <DropdownItem
                        isReadOnly
                        key="direction"
                        className="cursor-default"
                        startContent={<Switch
                            isSelected={direction === "ascending"}
                            size="sm"
                            color="primary"
                            thumbIcon={({isSelected, className}) => isSelected ? (
                                <BsArrowUp className={className}/>) : (<BsArrowDown className={className}/>)}
                            onValueChange={handleDirectionChange}
                        />}
                    >
                        {capitalize(direction ?? "")}
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    </div>);
}

export default TableSort;
