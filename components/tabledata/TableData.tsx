'use client';
import React, {Suspense, useEffect, useRef} from 'react';
import {
    Button,
    cn,
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
import Text from "@/components/Text";
import {capitalize} from "@nextui-org/shared-utils";
import CountUp from "react-countup";
import {TableConfigProps} from "@/types/table/TableDataTypes";
import {FilterProps} from "@/types/table/default_config";
import {ChevronDownIcon} from "@nextui-org/shared-icons";
import {icon_color, icon_size} from "@/lib/utils";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useIsClient} from "@/hooks/ClientRendering";
import Loading from "@/components/spinner/Loading";
import {LuSearch, LuTrash2} from 'react-icons/lu';
import Typography from "@/components/common/typography/Typography";

interface TableProp<T extends { id: string | number }> extends TableProps {
    config: TableConfigProps<T>;
    filterItems?: FilterProps[];
    filterConfig?: (key: Selection) => T[];
    items: T[];
    sort?: SortDescriptor;
    endContent?: React.ReactNode | (() => React.ReactNode);
    counterName?: string;
    isLoading?: boolean;
    contentTop?: React.JSX.Element;
    onSelectToDelete?: boolean
    selectedKeys?: Selection;
    setSelectedKeys?: (keys: Selection) => void;
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
                                                          selectedKeys: selKeys,
                                                          setSelectedKeys: setSelKeys,
                                                          ...props
                                                      }: TableProp<T> & SearchProps<T>) {
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>(sort ? sort : {
        column: "id", direction: "descending"
    });

    const getCurrentPath = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchValueFromParams = searchParams.get('search') || '';
    const filterValueFromParams = searchParams.get('filter') || '';
    const [get, set] = React.useState<Selection>(new Set([]));
    const [selectedKeys, setSelectedKeys] = [selKeys || get, setSelKeys || set];
    const [filterValue, setFilterValue] = React.useState(searchValueFromParams);
    const [filter, setFilter] = React.useState<Selection>(() => {
        const values = filterValueFromParams.split(',');
        return values.length === 1 && values[0] === '' ? new Set([]) : new Set(values);
    });
    const hasSearchFilter = Boolean(filterValue);
    const isActionable = selectedKeys === 'all' || selectedKeys.size >= 2;

    const filteredItems = React.useMemo(() => {
        let filteredUsers: T[] = [];

        if (Array.isArray(items)) {
            // Filter out undefined items
            filteredUsers = [...items].filter(item => item !== undefined);

            // Apply search filter if applicable
            if (hasSearchFilter && searchingItemKey) {
                filteredUsers = filteredUsers.filter((user) => genericSearch(user, searchingItemKey, filterValue));
            }

            // Apply custom filter if filter is not 'all' and it has valid entries
            if (filter !== "all" && filter.size > 0) {
                if (filterConfig) {
                    // If filterConfig is available, use it to filter users
                    filteredUsers = filteredUsers.filter((user) => filterConfig(filter).includes(user));
                } else {
                    // Filter users based on dynamic filter items
                    filteredUsers = filteredUsers.filter((user) => {
                        const userProperties = Object.keys(user) as (keyof T)[];

                        // Check if there is a parent item in filterItems
                        let parentItem: string | undefined;
                        if (filterItems) {
                            parentItem = filterItems.find(item => item.parent)?.parent; // Get the parent key
                        }

                        // Create a boolean to track if the user matches the filter
                        return Array.from(filter).every((filterItem) => {
                            // Check if any user property matches the filterItem
                            return userProperties.some(property => {
                                const propertyValue = user[property];

                                // If there is a parent item, check if the property matches the parent
                                if (parentItem && property === parentItem) {
                                    return String(propertyValue) === String(filterItem); // Compare as strings
                                } else {
                                    if (typeof propertyValue === 'string') {
                                        return propertyValue.toLowerCase() === filterItem.toString().toLowerCase();
                                    }
                                }
                                // For string properties, check for case-insensitive matches


                                // Check for non-string values (consider how you want to match these)
                                return propertyValue === filterItem; // Ensure direct comparison for non-string values
                            });
                        });
                    });
                }
            }


        } else {
            console.error("items is not iterable");
        }
        return filteredUsers;
    }, [items, hasSearchFilter, searchingItemKey, filter, filterValue, filterConfig, filterItems]);

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
            // router.push(`${getCurrentPath}?search=${value}`);
            router.push(`${getCurrentPath}?search=${value}${filter !== "all" && filter.size > 0 ? `&filter=${Array.from(filter).join(',')}` : ''}`);
            setFilterValue(value);
        } else {
            setFilterValue("");
            router.push(`${getCurrentPath}${filter !== "all" && filter.size > 0 ? `?filter=${Array.from(filter).join(',')}` : ''}`);
            // router.push(`${getCurrentPath}`);
        }
    }, [getCurrentPath, router, filter]);

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
                    <div className="flex gap-3">
                        {searchingItemKey && (<Input
                            isClearable
                            variant="bordered"
                            radius="sm"
                            className="max-w-sm"
                            color="primary"
                            placeholder={`Search by ${searchingItemKey.map((item) => item.toString().replace(/[,_]+/g, ' ')).join(", ").toUpperCase()}`}
                            startContent={<LuSearch className={cn("text-small", icon_color, icon_size)}/>}
                            value={filterValue} // Set the value of the input
                            onClear={() => onClear()}
                            onValueChange={onSearchChange}
                        />)}
                        <div className='flex w-full flex-row gap-3 justify-end'>
                            {filterItems && (<div className="flex gap-3 items-center">
                                <Dropdown classNames={{content: 'rounded'}}>
                                    <DropdownTrigger className="hidden sm:flex">
                                        <Button radius="sm" endContent={<ChevronDownIcon
                                            className={cn('text-small', icon_color, icon_size)}/>}
                                                variant="bordered">
                                            <Typography className="text-default-400">
                                                {filter !== "all" && filter.size > 0 ? `Filtered by: ${Array.from(filterItems)
                                                        .filter((item) => item.filtered.some((filteredItem) => Array.from(filter).some((f) => String(f) === filteredItem.uid)))
                                                        .map((item) => item.category)  // Return the `category` for each item that matches
                                                        .join(", ")}`                 // Join them with commas
                                                    : "Filtered options"}
                                            </Typography>
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
                                                const sectionSelected = selectedFilter.filter((key) => item.filtered.some((data) => data.uid === key));

                                                // Clear old selections from the section by iterating over the section items
                                                item.filtered.forEach((data) => {
                                                    newFilter.delete(data.uid); // Remove all previously selected keys from this section
                                                });

                                                // Add only the new selection
                                                if (sectionSelected.length > 0) {
                                                    newFilter.add(sectionSelected[sectionSelected.length - 1]); // Add the latest selected item
                                                }
                                            });


                                            setFilter(newFilter);

                                            // Handle URL params
                                            const newSearchParams = new URLSearchParams(searchParams.toString());
                                            if (newFilter.size > 0) {
                                                newSearchParams.set('filter', Array.from(newFilter).join(','));
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
                                            <DropdownSection key={item.category} title={item.category}
                                                             showDivider={filterItems.length > 1}>
                                                {item.filtered.map((data) => (
                                                    <DropdownItem key={data.uid} className="capitalize">
                                                        {capitalize(data.name)}
                                                    </DropdownItem>))}
                                            </DropdownSection>))}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>)}
                            <div
                                className='ms-auto self-center'>{typeof endContent === 'function' ? endContent() : endContent}</div>
                        </div>
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
                    {selectedKeys === "all" || selectedKeys.size === sortedItems.length ? `All ${counterName?.toLocaleLowerCase()} selected` : `${selectedKeys.size} of ${sortedItems.length} selected`}
                </Text>
                {onSelectToDelete && isActionable && (<Tooltip color="danger"
                                                               content={`Delete ${selectedKeys === "all" ? "all users selected" : `${selectedKeys.size} users`}`}>
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        <LuTrash2/>
                    </span>
                </Tooltip>)}
            </div>
        </section>);
    }, [counterName, isActionable, onSelectToDelete, selectedKeys, sortedItems.length]);

    const loadingState = isLoading ? "loading" : "idle";
    const emptyContent = sortedItems.length === 0 && !isLoading && 'No data found. Try to refresh';

    return (<div className="flex flex-col h-full w-full overflow-hidden">
            {/* Show section if either one is not null */}
            {(counterName || contentTop || endContent || filterItems || searchingItemKey) && (<section>
                {topContent}
            </section>)}
            <ScrollShadow size={20} className="flex-1">
                <Table
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    selectionMode={selectionMode}
                    removeWrapper
                    isHeaderSticky
                    classNames={{
                        base: "h-full",
                        emptyWrapper: "h-full",
                        loadingWrapper: "h-full",
                    }}
                    {...props}
                >
                    <TableHeader columns={config.columns}>
                        {(column: {
                            uid: any;
                            name: string;
                            sortable?: boolean,
                            columnAlignment?: "center" | "left" | "right",
                            columnClassName?: string
                        }) => (<TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={column.sortable}
                            className={cn("text-foreground-500", `text-${column.columnAlignment ?? "left"}`, column.columnClassName)}
                        >
                            {column.name.toUpperCase()}
                        </TableColumn>)}
                    </TableHeader>
                    <TableBody
                        emptyContent={emptyContent}
                        items={sortedItems}
                        loadingContent={<Loading/>}
                        loadingState={loadingState}
                    >
                        {(item: T) => (<TableRow key={item.id}
                                                 className={props.onRowAction ? "cursor-pointer" : "cursor-default"}>
                            {(columnKey: React.Key) => {
                                const row = config.columns.find(column => column.uid === columnKey)
                                return (<TableCell key={String(columnKey)}
                                                   className={cn("py-3", `text-${row?.columnAlignment ?? "left"}`, row?.rowClassName)}>
                                    {config.rowCell(item, columnKey)}
                                </TableCell>)
                            }}
                        </TableRow>)}
                    </TableBody>
                </Table>
            </ScrollShadow>
            {selectionMode === "multiple" && (<section className="bg-amber-500">{bottomContent}</section>)}
        </div>

    );

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