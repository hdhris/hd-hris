import {useCallback, useEffect, useMemo, useState} from 'react';
import {Selection} from "@nextui-org/react";
import {valueOfObject} from "@/helper/objects/pathGetterObject";
import {usePathname, useRouter, useSearchParams} from "next/navigation";


function useFilter<T>(items: T[]) {
    const getCurrentPath = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const filterValueFromParams = searchParams.get('filter') || '';
    const searchValueFromParams = searchParams.get('search') || '';

    const [filter, setFilter] = useState<Selection>(() => {
        const values = filterValueFromParams.split(',');
        return values.length === 1 && values[0] === '' ? new Set([]) : new Set(values);
    });


    const onFilterChange = useCallback((value: Selection) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());

        // Update filter query parameter
        if (value !== 'all' && value.size > 0) {
            newSearchParams.set('filter', Array.from(value).join(','));
        } else {
            newSearchParams.delete('filter');
        }

        // Keep the existing search query parameter
        if (searchValueFromParams) {
            newSearchParams.set('search', searchValueFromParams);
        }

        // Build new path with updated query parameters
        const newPath = `${getCurrentPath}?${newSearchParams.toString()}`;

        // Navigate to the new path
        router.push(newPath);
        setFilter(value); // Update the filter state
    }, [getCurrentPath, router, searchParams, searchValueFromParams]);

    const filteredItems = useMemo(() => {
        let filteredUsers: T[] = [...items]; // Start with the already searched items

        // If we have filters applied
        if (filter !== "all" && filter.size > 0) {
            // Apply custom filterConfig logic, if passed
            // if (filterConfig) {
            //     filteredUsers = filteredUsers.filter((user) => filterConfig(filter).includes(user));
            // } else {
            // Default filter logic based on filter items and the value of each filter
            if (filter instanceof Set && filter.size > 0) {
                Array.from(filter).forEach((ft) => {
                    filteredUsers = filteredUsers.filter((item) => {
                        // ft is in format 'key=value', so split and compare item fields
                        const [key, value] = ft.toString().split('=');
                        return String(valueOfObject(item, key)) === value;
                    });
                });
            }
            // }
        }

        // console.log("Filtered Items: ", filteredUsers);
        return filteredUsers;
    }, [items, filter]);

    return {filteredItems, onFilterChange, filter};
}

export default useFilter;
