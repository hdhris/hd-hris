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
import { LuSearch, LuTrash2 } from 'react-icons/lu';
import { valueOfObject } from '@/helper/objects/pathGetterObject';
import { joinNestedKeys } from '@/helper/objects/joinNestedKeys';
import Typography from '../common/typography/Typography';

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

type NestedKeys<T> = {
    [K in keyof T]: T[K] extends Record<string, any>
        ? K | [K, NestedKeys<T[K]>]
        : K; // Return the key itself if it's not an object
}[keyof T];


interface SearchProps<T> {
    searchingItemKey?: NestedKeys<T>[]; // e.g., [["details", "address"], ["details", "phone"]]
}

function genericSearch<T>(object: T, searchingItemKey: NestedKeys<T>[], query: string): boolean {
    let searchable = false;
    searchingItemKey.forEach(property => {
        // const value = object[property];
        let newProperty = Array.isArray(property) ? joinNestedKeys(property) : property;
        // console.log("New Prop: ",newProperty)
        const value = valueOfObject(object, String(newProperty));

        // console.log("Query: ",String(query.toLowerCase()));
        // console.log("Value: ",String(value));
        searchable = String(value).toLowerCase().includes(query.toLowerCase())
    });
    return searchable;
}

function DataTable<T extends { id: string | number }>({  // T extends { id: string | number }
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
                                                          selectedKeys : selKeys,
                                                          setSelectedKeys : setSelKeys,
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
    const [selectedKeys, setSelectedKeys] = [selKeys||get , setSelKeys||set];
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
            filteredUsers = [...items].filter(item => item !== undefined);

            if (hasSearchFilter && searchingItemKey) {
                filteredUsers = filteredUsers.filter((user) => genericSearch(user, searchingItemKey, filterValue));
            }

            if (filter !== "all" && filter.size > 0) {
                if (filterConfig) {
                    filteredUsers = filteredUsers.filter((user) => filterConfig(filter).includes(user));
                } else {
                    if (filter instanceof Set && filter.size > 0) {
                        Array.from(filter).forEach((ft) => {
                          filteredUsers = filteredUsers.filter((items) => {
                            // console.log("Filter: ",ft);
                            // console.log("Name: ", (items as any).name)
                            // console.log("Value: ",String(valueOfObject(items,ft.toString().split('=')[0])))
                            // console.log("Result: ",String(valueOfObject(items,ft.toString().split('=')[0])) === ft.toString().split('=')[1])
                            return String(valueOfObject(items,ft.toString().split('=')[0])) === ft.toString().split('=')[1]
                          });
                        });
                      }
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
        return (
          <Suspense fallback={<Spinner />}>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                {searchingItemKey && (
                  <Input
                    isClearable
                    variant="bordered"
                    radius="sm"
                    className="max-w-sm"
                    color="primary"
                    placeholder={`Search by ${searchingItemKey
                            .map((item) => {
                                // Convert to dot notation string
                                const joinedKey = Array.isArray(item) ? joinNestedKeys(item) : String(item);
                                // Split by dot and get the last segment
                                const lastSegment = joinedKey.split(".").pop();
                                // Replace any undesired characters and return the result
                                return lastSegment?.replace(/[,_]+/g, " ");
                            })
                            .join(", ")
                            .toUpperCase()}`}
                    startContent={
                      <LuSearch
                        className={cn("text-small", icon_color, icon_size)}
                      />
                    }
                    value={filterValue} // Set the value of the input
                    onClear={() => onClear()}
                    onValueChange={onSearchChange}
                  />
                )}
                <div className="flex w-full flex-row gap-3 justify-end">
                  {filterItems && (
                    <div className="flex gap-3 items-center">
                      <Dropdown classNames={{ content: "rounded" }}>
                        <DropdownTrigger className="hidden sm:flex">
                          <Button
                            radius="sm"
                            endContent={
                              <ChevronDownIcon
                                className={cn(
                                  "text-small",
                                  icon_color,
                                  icon_size
                                )}
                              />
                            }
                            variant="bordered"
                          >
                            {filter !== "all" && filter.size > 0
                              ? `Filter by: ${Array.from(filterItems)
                                  .filter((item) =>
                                    item.filtered.some((filteredItem) =>
                                      Array.from(filter).some((f) =>
                                        String(f).includes(filteredItem.key)
                                      )
                                    )
                                  )
                                  .map((item) => item.category) // Return the `category` for each item that matches
                                  .join(", ")}` // Join them with commas
                              : "Filter options"}
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
                            // console.log("Selected: ",selectedFilter)

                            // Ensure one selection per section
                            filterItems.forEach((item) => {
                              const sectionSelected = selectedFilter.filter(
                                (key) =>
                                  item.filtered.some(
                                    (data) =>
                                      `${data.key}=${data.value}` === key
                                  )
                              );

                              // Clear old selections from the section by iterating over the section items
                              item.filtered.forEach((data) => {
                                newFilter.delete(`${data.key}=${data.value}`); // Remove all previously selected keys from this section
                              });

                              // Add only the new selection
                              if (sectionSelected.length > 0) {
                                newFilter.add(
                                  sectionSelected[sectionSelected.length - 1]
                                ); // Add the latest selected item
                              }
                            });

                            setFilter(newFilter);
                            // console.log("New Selected: ",newFilter)

                            // Handle URL params
                            const newSearchParams = new URLSearchParams(
                              searchParams.toString()
                            );
                            if (newFilter.size > 0) {
                              newSearchParams.set(
                                "filter",
                                Array.from(newFilter).join(",")
                              );
                            } else {
                              newSearchParams.delete("filter");
                            }
                            if (filterValue) {
                              newSearchParams.set("search", filterValue);
                            }
                            router.push(
                              `${getCurrentPath}?${newSearchParams.toString()}`
                            );
                          }}
                        >
                          {filterItems.map((item) => (
                            <DropdownSection
                              key={item.category}
                              title={item.category}
                              showDivider
                            >
                              {item.filtered.map((data) => (
                                <DropdownItem
                                  key={`${data.key}=${data.value}`}
                                  className="capitalize"
                                >
                                  {capitalize(data.name)}
                                </DropdownItem>
                              ))}
                            </DropdownSection>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  )}
                  <div className="ms-auto self-center">
                    {typeof endContent === "function"
                      ? endContent()
                      : endContent}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                {counterName && (
                  <Typography className="text-medium font-semibold text-primary/50">
                  <CountUp start={0} end={sortedItems.length} suffix={` ${counterName}`}/>
                  {/*{ title ? Total < CountUp start={0} end={values.length}/>}*/}
                  {/*{selectedKeys ? (selectedKeys === "all" ? "All items selected" : `${selectedKeys.size} of ${values.length} selected`) : ''}*/}
              </Typography>
                  // <h1 className="leading-none text-2xs font-semibold text-gray-400 dark:text-white pb-1">
                  //   <span>
                  //     <CountUp start={0} end={sortedItems.length} />{" "}
                  //   </span>{" "}
                  //   {counterName}
                  // </h1>
                )}
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
                    {selectedKeys === "all" || selectedKeys.size===sortedItems.length ? `All ${counterName?.toLocaleLowerCase()} selected` : `${selectedKeys.size} of ${sortedItems.length} selected`}
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

    return (
    <div className="flex flex-col flex-1 overflow-hidden">
        {/* Show section if either one is not null */}
        {(counterName ||contentTop || endContent || filterItems || searchingItemKey) && <section>
            {topContent}
        </section>}
        <ScrollShadow size={20} className='flex-1'>
              <Table
                  aria-label={props.title || counterName || "Table"}
                  sortDescriptor={sortDescriptor}
                  onSortChange={setSortDescriptor}
                  selectedKeys={selectedKeys}
                  onSelectionChange={setSelectedKeys}
                  selectionMode={selectionMode}
                  isHeaderSticky
                  className='h-full'
                  classNames={{
                    base: 'h-full',
                    table: 'h-fit',
                    tbody: 'h-full',
                    wrapper: 'h-full',
                  }}
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
                          className="flex-1"
                      />) : null}
                      loadingState={loadingState}
                  >
                      {(item: T) => (<TableRow key={item.id} className='cursor-pointer h-fit'>
                          {(columnKey: React.Key) => (<TableCell key={String(columnKey)} className='py-3'>
                              {config.rowCell(item, columnKey)}
                          </TableCell>)}
                      </TableRow>)}
                  </TableBody>
              </Table>
          </ScrollShadow>
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