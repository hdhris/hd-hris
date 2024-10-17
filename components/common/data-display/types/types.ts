import {
    ButtonGroupProps,
    PaginationProps,
    Selection,
    SelectionMode,
    SortDescriptor,
    TableProps
} from "@nextui-org/react";
import {TableConfigProps} from "@/types/table/TableDataTypes";
import React, {ReactNode} from "react";
import {FilterProps} from "@/types/table/default_config";
import {NestedKeys} from "@/hooks/types/types";
import {DataFilterProps, SearchProps, SortProps} from "@/components/util/types/types";

export interface DataDisplayControlProps<T> extends DataControlProps{
    children: (data: T[], sortDescriptor?: SortDescriptor, onSortChange?: (value: SortDescriptor) => void) => ReactNode
    searchProps: Omit<SearchProps<T>, "onChange">
    filterProps: Omit<DataFilterProps, "onChange" | "filterValue">
    sortProps: Omit<SortProps, "onSortChange">
    paginationProps?: Omit<PaginationProps, "total">
    buttonGroupProps?: ButtonGroupProps
    isTable: boolean
    isGrid: boolean
    isList: boolean
}

export interface DataTableProps<T> extends Omit<TableProps, "aria-label"> {
    data: T[];
    config: TableConfigProps<T>;
    isLoading?: boolean;
    emptyContent?: string | React.ReactNode;
}

export interface DataControlProps {
    className?: {
        wrapper: string;
        upper: string;
        lower: {
            selectedKeysClassname: string;
            paginationClassname: string;
            buttonClassname: string;
        };
    }
}
