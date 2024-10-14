"use client"
import React, {useCallback, useMemo, useState} from "react";
import {Selection, SortDescriptor} from "@nextui-org/react";
import {columns, statusOptions, users} from "./data";
import {PaginationControl} from "./PaginationControl";
import {FilterTable} from "@/isolatedPages/data-table/FilterTable";
import {DataTable, TableHeaderColumn} from "@/isolatedPages/data-table/DataTable";

const INITIAL_VISIBLE_COLUMNS = ["name", "role", "status", "actions"];

export default function TableContainer() {
    const [filterValue, setFilterValue] = useState("");
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
    const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
    const [statusFilter, setStatusFilter] = useState<Selection>("all");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "age", direction: "ascending",
    });
    const [page, setPage] = useState(1);

    const pages = Math.ceil(users.length / rowsPerPage);

    const headerColumns: TableHeaderColumn[] = useMemo(() => {
        if (visibleColumns === "all") return columns;
        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns]);

    const filteredItems = useMemo(() => {
        let filteredUsers = [...users];

        if (filterValue) {
            filteredUsers = filteredUsers.filter((user) => user.name.toLowerCase().includes(filterValue.toLowerCase()));
        }
        if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
            filteredUsers = filteredUsers.filter((user) => Array.from(statusFilter).includes(user.status));
        }
        return filteredUsers;
    }, [filterValue, statusFilter]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof typeof users[0]];
            const second = b[sortDescriptor.column as keyof typeof users[0]];
            const cmp = first < second ? -1 : first > second ? 1 : 0;
            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const handleSearchChange = useCallback((value?: string) => {
        setFilterValue(value || "");
        setPage(1);
    }, []);

    const renderCell = (item: any, columnKey: React.Key) => {
        switch (columnKey) {
            case "name":
                return item.name;
            case "role":
                return item.role;
            default:
                return null;
        }
    };

    return (<div>
            <FilterTable />
            <DataTable
                data={sortedItems}
                selectedKeys={selectedKeys}
                sortDescriptor={sortDescriptor}
                onSelectionChange={setSelectedKeys}
                onSortChange={setSortDescriptor}
                config={}/>
            <PaginationControl
                page={page}
                totalPages={pages}
                onPageChange={setPage}
                selectedCount={selectedKeys !== "all" ? selectedKeys.size : 0}
                totalItems={items.length}
            />
        </div>);
}
