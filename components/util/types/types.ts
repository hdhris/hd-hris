import {InputProps} from "@nextui-org/input";
import {NestedKeys, SortedItemProps} from "@/hooks/types/types";
import {ButtonGroupProps, PaginationProps, Selection, SortDescriptor} from "@nextui-org/react";
import {FilterProps} from "@/types/table/default_config";
import {DataControlProps} from "@/components/common/data-display/types/types";
import {ReactNode} from "react";



export interface SearchProps<T> extends Omit<InputProps, "onChange">{
    onChange: (value: string) => void
    searchingItemKey: NestedKeys<T>[]
}

export interface SortProps {
    sortItems: SortedItemProps[];
    initialValue?: SortDescriptor;
    onSortChange: (keys: SortDescriptor) => void;
    wrapperClassName?: string
}


export interface DataFilterProps {
    filterItems: FilterProps[]
    onChange: (value: Selection) => void
    filterValue: Selection
    wrapperClassName?: string
}