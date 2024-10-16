import React, {useCallback, useEffect} from "react";
import {SortDescriptor} from "@nextui-org/react";
import {useRouter} from "next/navigation";

interface SortHookProps {
    sort?: SortDescriptor;
}

export function useSort<T>(data: T[], {sort}: SortHookProps = {}) {
    const router = useRouter()
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>(sort || {
        column: "id",
        direction: "descending",
    });

    useEffect(() => {
        // On component mount, initialize sort state from the URL
        const getCurrentSort = new URLSearchParams(window.location.search);
        const sortParam = getCurrentSort.get("sort");
        if (sortParam) {
            const [column, dir] = sortParam.split("&");
            if(!column) setSortDescriptor({ column, direction: undefined });
            else {
                const direction = dir === "desc" ? "descending" : "ascending";
                setSortDescriptor({column, direction});
            }
        }
    }, []); // Empty dependency array to only run on component mount

    useEffect(() => {
        // Update the URL and sorting state whenever the sortDescriptor changes
        if (sortDescriptor?.column && sortDescriptor?.direction) {
            const newSearchParams = new URLSearchParams(window.location.search);
            newSearchParams.set("sort", `${sortDescriptor.column}&${sortDescriptor.direction === "descending" ? "desc" : "asc"}`);

            // Update the URL with the new sort parameters
            router.replace(`?${newSearchParams.toString()}`);
        }
    }, [router, sortDescriptor]);



    const onChange = useCallback((sort: SortDescriptor) => {
        setSortDescriptor(sort);

        // Get current search parameters from the URL
        const newSearchParams = new URLSearchParams(window.location.search);

        const column = sort.column ?? "";
        const direction = sort.direction ?? "";

        let sortPath = "";

        if (column) {
            sortPath = `${sortPath}=${encodeURIComponent(column)}`;
        }

        if (direction) {
            sortPath = `${sortPath}&${encodeURIComponent(direction.slice(0, direction === "descending" ? 4 : 3))}`;
        }

        if (column || direction) {
            // Set the new sortPath in search parameters
            newSearchParams.set("sort", sortPath);
        } else {
            newSearchParams.delete("sort");
        }

        // Update the router with the new search parameters
        router.push(`?${newSearchParams.toString()}`);
    }, [setSortDescriptor, router]);



    const sortedItems = React.useMemo(() => {
        return [...data].sort((a, b) => {
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
    }, [sortDescriptor, data]);

    return {onChange, sortedItems};
}
