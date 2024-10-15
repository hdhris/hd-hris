import React from 'react';
import {cn, Input, Selection} from '@nextui-org/react';
import {joinNestedKeys} from "@/helper/objects/joinNestedKeys";
import {LuSearch} from "react-icons/lu";
import {icon_color, icon_size, icon_size_sm} from "@/lib/utils";


interface TableSearch {
    value: string | (readonly string[] & string) | undefined
    onChange: (value: string) => void
    searchingItemKey?: unknown
}
function TableSearch({ value, onChange, searchingItemKey }: TableSearch) {
    return (
        <Input
            variant="bordered"
            radius="md"
            className="max-w-sm"
            placeholder={
                Array.isArray(searchingItemKey) && searchingItemKey.length > 0
                    ? `Search by ${searchingItemKey
                        .map((item: string | string[]) => {
                            // Convert nested keys array into dot-notation string
                            const joinedKey = Array.isArray(item) ? joinNestedKeys(item) : item;
                            // Get the last segment of the dot-notation string
                            const lastSegment = joinedKey.split(".").pop();
                            // Replace any undesired characters and return a cleaned version
                            return lastSegment?.replace(/[,_]+/g, " ");
                        })
                        .join(", ")
                        .toUpperCase()}`
                    : "Search..."
            }
            startContent={
                <LuSearch
                    className={cn("text-slate-700", icon_size_sm)}
                />
            }
            value={value} // Set the value of the input
            onValueChange={onChange}
        />
    );
}

export default TableSearch;
