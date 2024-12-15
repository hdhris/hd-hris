import React from 'react';
import {cn, Input} from '@nextui-org/react';
import {joinNestedKeys} from "@/helper/objects/joinNestedKeys";
import {LuSearch} from "react-icons/lu";
import {icon_size_sm} from "@/lib/utils";
import {SearchProps} from "@/components/util/types/types";


function Search<T>({value, onChange, searchingItemKey, ...rest}: SearchProps<T>) {

    return (<Input
        {...rest}
        variant="bordered"
        radius="md"
        className={cn("w-[250px] lg:w-[400px]", rest.className)}
        placeholder={Array.isArray(searchingItemKey) && searchingItemKey.length > 0 ? `Search by ${searchingItemKey
            .map((item) => {
                // Convert nested keys array into dot-notation string
                const joinedKey = Array.isArray(item) ? joinNestedKeys(item) : item;
                // Get the last segment of the dot-notation string
                const lastSegment = joinedKey.toString().split(".").pop();
                // Replace any undesired characters and return a cleaned version
                return lastSegment?.replace(/[,_]+/g, " ");
            })
            .join(", ")
            .toUpperCase()}` : "Search..."}
        startContent={<LuSearch
            className={cn("text-slate-700", icon_size_sm)}
        />}
        value={value} // Set the value of the input
        onValueChange={onChange}
    />);
}

export default Search;
