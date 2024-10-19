"use client"
import React from 'react';
import {
    Button, cn, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Selection
} from '@nextui-org/react';
import {icon_size_sm} from "@/lib/utils";
import {capitalize} from "@nextui-org/shared-utils";
import {LuListFilter} from "react-icons/lu";
import {DataFilterProps} from "@/components/util/types/types";



function Filter({filterItems, onChange, filterValue, wrapperClassName}: DataFilterProps) {
    const [filter, setFilter] = React.useState<Selection>(filterValue ?? new Set([]));

    return (<div className={cn("flex gap-3 items-center", wrapperClassName)}>
        <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
                <Button
                    size="sm"
                    radius="md"
                    color="primary"
                    startContent={<LuListFilter
                        className={cn("text-slate-700", icon_size_sm)}
                    />}
                    variant="bordered"
                >
                    Filters
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Table Columns"
                className="max-h-96 overflow-y-auto"
                closeOnSelect={false}
                selectedKeys={filter}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                    const newFilter = new Set(filter); // Clone current filter
                    const selectedFilter = Array.from(keys) as string[];

                    // Ensure one selection per section
                    filterItems.forEach((item) => {
                        const sectionSelected = selectedFilter.filter((key) => item.filtered.some((data) => `${data.key}=${data.value}` === key));

                        // Clear old selections from the section by iterating over the section items
                        item.filtered.forEach((data) => {
                            newFilter.delete(`${data.key}=${data.value}`); // Remove all previously selected keys from this section
                        });

                        // Add only the new selection
                        if (sectionSelected.length > 0) {
                            newFilter.add(sectionSelected[sectionSelected.length - 1]); // Add the latest selected item
                        }
                    });

                    setFilter(newFilter);
                    onChange(newFilter)
                }}
            >
                {filterItems.map((item) => (<DropdownSection
                    key={item.category}
                    title={item.category}
                    showDivider
                >
                    {item.filtered.map((data) => (<DropdownItem
                        key={`${data.key}=${data.value}`}
                        className="capitalize"
                    >
                        {capitalize(data.name)}
                    </DropdownItem>))}
                </DropdownSection>))}
            </DropdownMenu>
        </Dropdown>
    </div>)
}

export default Filter;
