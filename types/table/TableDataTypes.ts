import React from "react";

export interface ColumnsProps<T = any> {
    name: string,
    uid: keyof T  | string,
    sortable?: boolean
}
export interface TableConfigProps<T> {
    rowCell: (item: T, columnKey: React.Key) => React.ReactElement;
    columns: ColumnsProps[],
}
