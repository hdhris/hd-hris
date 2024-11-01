import React, {useCallback, useEffect} from "react";
import {SortDescriptor} from "@nextui-org/react";
import {useRouter, useSearchParams} from "next/navigation";

interface SortHookProps {
    sort?: SortDescriptor;
}

export function useSort<T>(data: T[], {sort}: SortHookProps = {}) {
    const searchParams = useSearchParams();
    const router = useRouter()
    const sortValueFromParams = searchParams.get('sort');
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>(sort || (sortValueFromParams ? JSON.parse(sortValueFromParams) : {
        column: "id",
        direction: "descending",
    }));

    
    const onSortChange = useCallback((sort: SortDescriptor) => {
        setSortDescriptor(sort);
        const newSearchParams = new URLSearchParams(searchParams.toString());
        if(sort.column?.toString().trim() === '') {
            newSearchParams.delete('sort');
        } else {
            newSearchParams.set('sort', JSON.stringify(sort));
        }
        router.push(`?${newSearchParams.toString()}`);
        // window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
    }, [router, searchParams]);



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


    return {onSortChange, sortedItems, sortDescriptor};
}
