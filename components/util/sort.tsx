import React, {useEffect, useMemo, useRef, useState} from "react";
import {Button} from "@nextui-org/button";
import {LuArrowDown, LuArrowDownUp, LuArrowUp} from "react-icons/lu";
import {
    cn, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Selection, SortDescriptor,
} from "@nextui-org/react";
import {icon_size_sm} from "@/lib/utils";
import {capitalize} from "@nextui-org/shared-utils";
import {SortedItemProps} from "@/hooks/types/types";
import {isEqual} from "lodash";
import {SortProps} from "@/components/util/types/types";




function Sort({sortItems, initialValue, onSortChange, wrapperClassName}: SortProps) {
    // Memoize the initial state
    const initial = useMemo(() => {
        const column = new Set(initialValue?.column ? [initialValue?.column] : []);
        const direction = new Set(initialValue?.direction ? [initialValue?.direction] : []);
        const initial = column.union(direction)
        return initial || {column: undefined, direction: undefined}; // Provide default values
    }, [initialValue]);

    const [selectedSort, setSelectedSort] = useState<Selection>(initial);

    const current = useRef<Selection>(initial);

    useEffect(() => {
        // Use deep comparison to check for changes
        if (!isEqual(current.current, initial)) {
            setSelectedSort(initial); // Update state
            current.current = initial; // Update reference
        }
    }, [initial]); // Only re-run when 'initial' changes


    useEffect(() => {
        const selectedKey = Array.from(selectedSort);
        onSortChange({column: selectedKey[0], direction: selectedKey[1] as "ascending" | "descending"});

    }, [selectedSort, onSortChange]);


    const handleSelectionChange = (keys: Selection) => {
        let columnKeys = new Set(selectedSort);  // Start with existing selected columns
        let orderKeys = new Set(selectedSort);  // Default to "asc" order

        const selectedKeys = Array.from(keys) as string[];

        // Check if user tried to deselect everything; if yes, revert to the previous selection
        if (selectedKeys.length === 0) {
            // Prevent clearing both column and order selection
            setSelectedSort(selectedSort);  // Keep previous state
            return;
        }

        // Extract column and order keys from selectedKeys
        selectedKeys.forEach((key) => {
            if (sortItems.some((item) => item.key === key)) {
                columnKeys = new Set([key]);  // Only keep the last selected column
            } else if (key === "ascending" || key === "descending") {
                orderKeys = new Set([key]);  // Only keep the last selected order (asc/desc)
            }
        });

        const finalKeys = columnKeys.union(orderKeys);
        setSelectedSort(finalKeys);
    };

    return (<div className={cn("flex gap-3 items-center", wrapperClassName)}>
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
                aria-label="Table Columns"
                className="max-h-96 overflow-y-auto"
                closeOnSelect={false}
                selectedKeys={selectedSort}
                selectionMode="multiple"
                onSelectionChange={handleSelectionChange}
            >
                <DropdownSection showDivider>
                    {sortItems.map((data) => (<DropdownItem
                        key={data.key}
                        className="capitalize"
                    >
                        {capitalize(data.name)}
                    </DropdownItem>))}
                </DropdownSection>
                <DropdownSection>
                    <DropdownItem key="ascending" startContent={<LuArrowUp className={cn("text-slate-700", icon_size_sm)}/>}>Ascending</DropdownItem>
                    <DropdownItem key="descending" startContent={<LuArrowDown className={cn("text-slate-700", icon_size_sm)}/>}>Descending</DropdownItem>
                </DropdownSection>
            </DropdownMenu>

        </Dropdown>
    </div>);
}

export default Sort;
