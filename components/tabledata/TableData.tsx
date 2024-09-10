'use client';
import React, {Suspense, useEffect, useRef, useState} from 'react';
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Input,
    ScrollShadow,
    Selection,
    SortDescriptor,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableProps,
    TableRow,
    Tooltip
} from '@nextui-org/react';
import {SearchIcon, Trash2} from "lucide-react";
import Text from "@/components/Text";
import {capitalize} from "@nextui-org/shared-utils";
import CountUp from "react-countup";
import {TableConfigProps} from "@/types/table/TableDataTypes";
import {FilterProps} from "@/types/table/default_config";
import {ChevronDownIcon} from "@nextui-org/shared-icons";
import {icon_color, icon_size} from "@/lib/utils";
import {cn} from '@nextui-org/react'
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useIsClient} from "@/hooks/ClientRendering";
import Loading from "@/components/spinner/Loading";

interface TableProp<T extends { id: string | number }> extends TableProps {
    config: TableConfigProps<T>;
    filterItems?: FilterProps[];
    filterConfig?: (key: Selection) => T[];
    items: T[];
    sort?: SortDescriptor;
    endContent?: () => React.ReactNode;
    counterName?: string;
    isLoading?: boolean;
    contentTop?: React.JSX.Element;
    onSelectToDelete?: boolean
}

interface SearchProps<T> {
    searchingItemKey?: Array<keyof T>;
}

function genericSearch<T>(object: T, searchingItemKey: Array<keyof T>, query: string): boolean {
    let searchable = false;
    searchingItemKey.forEach(property => {
        const value = object[property];

        if (typeof value === "string" || typeof value === "number") {
            if (value.toString().toLowerCase().includes(query.toLowerCase())) {
                searchable = true;
            }
        }
    });
    return searchable;
}

function DataTable<T extends { id: string | number }>({
                                                          config,
                                                          items,
                                                          sort,
                                                          onSelectToDelete,
                                                          searchingItemKey,
                                                          filterConfig,
                                                          filterItems,
                                                          endContent,
                                                          counterName,
                                                          isLoading,
                                                          selectionMode,
                                                          contentTop,
                                                          ...props
                                                      }: TableProp<T> & SearchProps<T>) {
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>(sort ? sort : {
        column: "id", direction: "descending"
    });

    const getCurrentPath = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchValueFromParams = searchParams.get('search') || '';
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
    const [filterValue, setFilterValue] = React.useState(searchValueFromParams);
    const [filter, setFilter] = React.useState<Selection>(new Set([]));
    const hasSearchFilter = Boolean(filterValue);
    const isActionable = selectedKeys === 'all' || selectedKeys.size >= 2;

    const filteredItems = React.useMemo(() => {
        let filteredUsers: T[] = [];

        if (Array.isArray(items)) {
            filteredUsers = [...items].filter(item => item !== undefined);

            if (hasSearchFilter && searchingItemKey) {
                filteredUsers = filteredUsers.filter((user) => genericSearch(user, searchingItemKey, filterValue));
            }

            if (filter !== "all" && filter.size > 0) {
                if (filterConfig) {
                    filteredUsers = filteredUsers.filter((user) => filterConfig(filter).includes(user));
                } else {
                    filteredUsers = filteredUsers.filter((user) => {
                        const userProperties = Object.keys(user) as (keyof T)[];
                        return Array.from(filter).every((filterItem) => userProperties.some(property => {
                            const propertyValue = user[property];
                            if (typeof propertyValue === 'string') {
                                return propertyValue.toLowerCase() === filterItem.toString().toLowerCase();
                            }
                            return false;
                        }));
                    });
                }
            }
        } else {
            console.error("items is not iterable");
        }
        return filteredUsers;
    }, [items, hasSearchFilter, filterConfig, filter, searchingItemKey, filterValue]);


    const chipContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chipContainerRef.current) {
            const chips = chipContainerRef.current.querySelectorAll<HTMLDivElement>('.current-filter-chip');
            if (chips.length > 0) {
                chips[chips.length - 1].focus();
            }
        }
    }, [filter, getCurrentPath]);

    const sortedItems = React.useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const getColumnValue = (item: T, column: keyof T | string): any => {
                if (typeof column === 'string') {
                    const keys = column.split('.');
                    let value: any = item;
                    for (const key of keys) {
                        if (value && typeof value === 'object' && key in value) {
                            value = value[key as keyof typeof value];
                        } else {
                            value = undefined;
                            break;
                        }
                    }

                    return value;
                }

                return item[column as keyof T];
            };

            const first = getColumnValue(a, sortDescriptor.column as keyof T);
            const second = getColumnValue(b, sortDescriptor.column as keyof T);

            const cmp = first < second ? -1 : first > second ? 1 : 0;
            return sortDescriptor.direction === 'descending' ? -cmp : cmp;
        });
    }, [sortDescriptor, filteredItems]);

    const onSearchChange = React.useCallback((value?: string) => {
        if (value) {
            router.push(`${getCurrentPath}?search=${value}`);
            setFilterValue(value);

        } else {
            setFilterValue("");
            router.push(`${getCurrentPath}`);
        }
    }, [getCurrentPath, router]);

    const onClear = React.useCallback(() => {
        setFilterValue("");
        router.push(`${getCurrentPath}${filter !== "all" && filter.size > 0 ? `?filter=${Array.from(filter).join(',')}` : ''}`);
    }, [getCurrentPath, router, filter]);


    const handleClose = (removeFilter: string) => {
        const newFilter = Array.from(filter).filter(item => item !== removeFilter);
        setFilter(new Set(newFilter));
    };

    const topContent = React.useMemo(() => {
        return (<Suspense fallback={<Spinner/>}>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between gap-3 items-end">
                        {
                            searchingItemKey && (
                                <Input
                                    isClearable
                                    variant="bordered"
                                    radius="sm"
                                    className="max-w-sm"
                                    color="primary"
                                    placeholder={`Search by ${searchingItemKey.map((item) => item.toString().replace(/[,_]+/g, ' ')).join(", ").toUpperCase()}`}
                                    startContent={<SearchIcon className={cn("text-small", icon_color, icon_size)}/>}
                                    value={filterValue} // Set the value of the input
                                    onClear={() => onClear()}
                                    onValueChange={onSearchChange}
                                />
                            )
                        }
                        {filterItems && (<div className="flex gap-3 items-center">
                            <Dropdown classNames={{content: 'rounded'}}>
                                <DropdownTrigger className="hidden sm:flex">
                                    <Button radius="sm" endContent={<ChevronDownIcon
                                        className={cn('text-small', icon_color, icon_size)}/>} variant="bordered">
                                        {filter !== "all" && filter.size > 0 ? capitalize(Array.from(filter)[0] as string) : "Filter..."}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Table Columns"
                                    className="max-h-96 overflow-y-auto"
                                    closeOnSelect={false}
                                    selectedKeys={filter}
                                    selectionMode="single"
                                    onSelectionChange={(keys) => {
                                        setFilter(keys as Selection);
                                        const newSearchParams = new URLSearchParams(searchParams.toString());
                                        if (keys !== "all" && keys.size > 0) {
                                            newSearchParams.set('filter', Array.from(keys).join(','));
                                        } else {
                                            newSearchParams.delete('filter');
                                        }
                                        if (filterValue) {
                                            newSearchParams.set('search', filterValue);
                                        }
                                        router.push(`${getCurrentPath}?${newSearchParams.toString()}`);
                                    }}
                                >
                                    {filterItems.map((item) => (
                                        <DropdownSection key={item.category} title={item.category} showDivider>
                                            {item.filtered.map((data) => (
                                                <DropdownItem key={data.uid} className="capitalize">
                                                    {capitalize(data.name)}
                                                </DropdownItem>))}
                                        </DropdownSection>))}
                                </DropdownMenu>
                            </Dropdown>
                            {endContent && endContent()}
                        </div>)}
                    </div>
                    <div className='flex justify-between items-center'>
                        {counterName &&
                            <h1 className="leading-none text-2xs font-semibold text-gray-400 dark:text-white pb-1">
                                <span><CountUp start={0} end={sortedItems.length}/> </span> {counterName}
                            </h1>}
                        {contentTop && contentTop}
                    </div>
                </div>
            </Suspense>

        );
    }, [searchingItemKey, filterValue, onSearchChange, filterItems, filter, endContent, sortedItems.length, counterName, contentTop, onClear, searchParams, router, getCurrentPath]);

    const bottomContent = React.useMemo(() => {
        return (<section className="py-2 px-2 flex justify-between items-center">
            <div className='flex gap-4 items-center'>
                <Text className="text-small font-semibold opacity-50">
                    {selectedKeys === "all" ? "All items selected" : `${selectedKeys.size} of ${sortedItems.length} selected`}
                </Text>
                {onSelectToDelete && isActionable && (<Tooltip color="danger"
                                                               content={`Delete ${selectedKeys === "all" ? "all users selected" : `${selectedKeys.size} users`}`}>
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        <Trash2/>
                    </span>
                </Tooltip>)}
            </div>
        </section>);
    }, [isActionable, onSelectToDelete, selectedKeys, sortedItems.length]);

    const loadingState = isLoading ? "loading" : "idle";
    const emptyContent = sortedItems.length === 0 && !isLoading && 'No data found. Try to refresh';

    return (<div className="grid grid-rows-[auto,1fr,auto] h-full w-full">
        {/* Show section if either one is not null */}
        {(counterName ||contentTop || endContent || filterItems || searchingItemKey) && <section className='pb-3'>
            {topContent}
        </section>}
        <div className='flex flex-col h-full overflow-y-hidden'>
            <ScrollShadow size={20} className='flex-1'>
                <Table
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    selectionMode={selectionMode}
                    {...props}
                >
                    <TableHeader columns={config.columns}>
                        {(column: { uid: any; name: string; sortable?: boolean }) => (<TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={column.sortable}
                        >
                            {column.name.toUpperCase()}
                        </TableColumn>)}
                    </TableHeader>
                    <TableBody
                        emptyContent={emptyContent}
                        items={sortedItems}
                        loadingContent={isLoading ? (<Spinner
                            color="primary"
                            label="Loading..."
                            classNames={{
                                base: 'h-screen mt-52', // wrapper: "" // Uncomment and specify if needed
                            }}
                        />) : null}
                        loadingState={loadingState}
                    >
                        {(item: T) => (<TableRow key={item.id} className='cursor-pointer '>
                            {(columnKey: React.Key) => (<TableCell key={String(columnKey)} className='py-3'>
                                {config.rowCell(item, columnKey)}
                            </TableCell>)}
                        </TableRow>)}
                    </TableBody>
                </Table>
            </ScrollShadow>
        </div>
        <section>
            {selectionMode === "multiple" && bottomContent}
        </section>
    </div>);
}

function TableData<T extends { id: string | number; }>(props: TableProp<T> & SearchProps<T>) {
    const isClient = useIsClient();
    return (<>
            {isClient ? <Suspense fallback={<Spinner/>}>
                <DataTable {...props}/>
            </Suspense> : <Loading/>}
        </>

    );
}

export default TableData;