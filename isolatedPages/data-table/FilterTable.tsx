"use client";
import React, {Suspense, useMemo} from "react";
import {
    Button, cn, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Input, Selection, Spinner
} from "@nextui-org/react";
import {ChevronDownIcon} from "@nextui-org/shared-icons";
import {LuSearch} from "react-icons/lu";
import {icon_color, icon_size} from "@/lib/utils";
import Typography from "@/components/common/typography/Typography";
import {capitalize} from "@nextui-org/shared-utils";
import CountUp from "react-countup";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useTableData} from "@/isolatedPages/data-table/TableProvider";
import {FilterProps} from "@/types/table/default_config";

interface TableFilterProps<T> {
    filterConfig?: (key: Selection) => T[];
    filterItems?: FilterProps[];
    contentTop?: React.JSX.Element;
    endContent?: React.ReactNode | (() => React.ReactNode);
    counterName?: string;
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

export function FilterTable<T extends object>({
                                                  filterConfig,
                                                  filterItems,
                                                  searchingItemKey,
                                                  contentTop,
                                                  endContent,
                                                  counterName
                                              }: TableFilterProps<T> & SearchProps<T>) {
    const {data: tableData} = useTableData<T[]>();
    const data = useMemo(() => {
        if (tableData) return tableData;
        return [];
    }, [tableData]);

    const getCurrentPath = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchValueFromParams = searchParams.get('search') || '';
    const filterValueFromParams = searchParams.get('filter') || '';
    const [filterValue, setFilterValue] = React.useState(searchValueFromParams);
    const hasSearchFilter = Boolean(filterValue);
    const [filter, setFilter] = React.useState<Selection>(() => {
        const values = filterValueFromParams.split(',');
        return values.length === 1 && values[0] === '' ? new Set([]) : new Set(values);
    });

    const filteredItems = React.useMemo(() => {
        let filteredUsers: T[] = [];

        if (Array.isArray(data)) {
            filteredUsers = [...data].filter(item => item !== undefined);

            if (hasSearchFilter && searchingItemKey) {
                filteredUsers = filteredUsers.filter(user => genericSearch(user, searchingItemKey, filterValue));
            }

            if (filter !== "all" && filter.size > 0) {
                if (filterConfig) {
                    filteredUsers = filteredUsers.filter(user => filterConfig(filter).includes(user));
                } else {
                    filteredUsers = filteredUsers.filter(user => {
                        const userProperties = Object.keys(user) as (keyof T)[];

                        let parentItem: string | undefined;
                        if (filterItems) {
                            parentItem = filterItems.find(item => item.parent)?.parent;
                        }

                        return Array.from(filter).every(filterItem => {
                            return userProperties.some(property => {
                                const propertyValue = user[property];
                                if (parentItem && property === parentItem) {
                                    return String(propertyValue) === String(filterItem);
                                } else {
                                    if (typeof propertyValue === 'string') {
                                        return propertyValue.toLowerCase() === filterItem.toString().toLowerCase();
                                    }
                                }
                                return propertyValue === filterItem;
                            });
                        });
                    });
                }
            }
        } else {
            console.error("data is not iterable");
        }
        return filteredUsers;
    }, [data, hasSearchFilter, searchingItemKey, filter, filterValue, filterConfig, filterItems]);

    const onClear = React.useCallback(() => {
        setFilterValue("");
        router.push(`${getCurrentPath}${filter !== "all" && filter.size > 0 ? `?filter=${Array.from(filter).join(',')}` : ''}`);
    }, [getCurrentPath, router, filter]);

    const onSearchChange = React.useCallback((value?: string) => {
        if (value) {
            router.push(`${getCurrentPath}?search=${value}${filter !== "all" && filter.size > 0 ? `&filter=${Array.from(filter).join(',')}` : ''}`);
            setFilterValue(value);
        } else {
            setFilterValue("");
            router.push(`${getCurrentPath}${filter !== "all" && filter.size > 0 ? `?filter=${Array.from(filter).join(',')}` : ''}`);
        }
    }, [getCurrentPath, router, filter]);

    return (<Suspense fallback={<Spinner/>}>
            <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                    {searchingItemKey && (<Input
                            isClearable
                            variant="bordered"
                            radius="sm"
                            className="max-w-sm"
                            color="primary"
                            placeholder={`Search by ${searchingItemKey.map(item => item.toString().replace(/[,_]+/g, ' ')).join(", ").toUpperCase()}`}
                            startContent={<LuSearch className={cn("text-small", icon_color, icon_size)}/>}
                            value={filterValue}
                            onClear={() => onClear()}
                            onValueChange={onSearchChange}
                        />)}
                    <div className="flex w-full flex-row gap-3 justify-end">
                        {filterItems && (<div className="flex gap-3 items-center">
                                <Dropdown classNames={{content: 'rounded'}}>
                                    <DropdownTrigger className="hidden sm:flex">
                                        <Button
                                            radius="sm"
                                            endContent={<ChevronDownIcon
                                                className={cn('text-small', icon_color, icon_size)}/>}
                                            variant="bordered"
                                        >
                                            <Typography className="text-default-400">
                                                {filter !== "all" && filter.size > 0 ? `Filtered by: ${Array.from(filterItems)
                                                    .filter(item => item.filtered.some(filteredItem => Array.from(filter).some(f => String(f) === filteredItem.uid)))
                                                    .map(item => item.category)
                                                    .join(", ")}` : "Filtered options"}
                                            </Typography>
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Table Columns"
                                        className="max-h-96 overflow-y-auto"
                                        closeOnSelect={false}
                                        selectedKeys={filter}
                                        selectionMode="multiple"
                                        onSelectionChange={keys => {
                                            const newFilter = new Set(filter);
                                            const selectedFilter = Array.from(keys) as string[];

                                            filterItems.forEach(item => {
                                                const sectionSelected = selectedFilter.filter(key => item.filtered.some(data => data.uid === key));

                                                item.filtered.forEach(data => {
                                                    newFilter.delete(data.uid);
                                                });

                                                if (sectionSelected.length > 0) {
                                                    newFilter.add(sectionSelected[sectionSelected.length - 1]);
                                                }
                                            });

                                            setFilter(newFilter);

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
                                        {filterItems.map(item => (
                                            <DropdownSection key={item.category} title={item.category}
                                                             showDivider={filterItems.length > 1}>
                                                {item.filtered.map(data => (
                                                    <DropdownItem key={data.uid} className="capitalize">
                                                        {capitalize(data.name)}
                                                    </DropdownItem>))}
                                            </DropdownSection>))}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>)}
                        <div className="ms-auto self-center">
                            {typeof endContent === 'function' ? endContent() : endContent}
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    {counterName && (
                        <h1 className="leading-none text-2xs font-semibold text-gray-400 dark:text-white pb-1">
              <span>
                <CountUp start={0} end={filteredItems.length}/>
              </span>{" "}
                            {counterName}
                        </h1>)}
                    {contentTop && contentTop}
                </div>
            </div>
        </Suspense>);
}
