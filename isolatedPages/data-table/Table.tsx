"use client"

import React from 'react';
import {TableProvider} from "@/isolatedPages/data-table/TableProvider";

function Table<T>() {
    return (
        <TableProvider <T>>
            Hi
        </TableProvider>
    );
}

export default Table;