import React, {useCallback, useEffect} from "react";
import {SortDescriptor} from "@nextui-org/react";
import {useRouter} from "next/navigation";

interface SortHookProps {
    sort?: SortDescriptor;
}

export function useSort<T>(data: T[], {sort}: SortHookProps = {}) {
    // const router = useRouter()
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>(sort || {
        column: "id",
        direction: "descending",
    });




    const onSortChange = useCallback((sort: SortDescriptor) => {
        setSortDescriptor(sort);
    }, [setSortDescriptor]);



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
