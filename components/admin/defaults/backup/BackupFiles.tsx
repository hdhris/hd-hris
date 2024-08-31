'use client'
import React from 'react';
import {BadgeProps} from "@nextui-org/react";
import Text from "@/components/Text";
import TableData from "@/components/tabledata/TableData";
import {ColumnsProps, TableConfigProps} from "@/types/table/TableDataTypes";
import {backupData, TableProps} from "@/sampleData/admin/defaults/backup/backupData";


const tableColumns: ColumnsProps[] = [{
    name: 'Date', uid: 'date', sortable: true,
}, {name: 'Time', uid: 'time', sortable: true,}, {name: 'Size', uid: 'size', sortable: true,}, {name: 'Status', uid: 'status', sortable: true,},{name: 'Action', uid: 'action'}, ]


function BackupFiles() {
    const TableEntry: TableConfigProps<TableProps> = {
        columns: tableColumns, rowCell: (item: TableProps, columnKey: React.Key) => {
            const cellValue = item[columnKey as keyof TableProps];
            return (<Text>{String(cellValue)}</Text>)
        }
    }

    return (<TableData
            aria-label="User Table"
            config={TableEntry}
            items={backupData}
            removeWrapper
            isStriped
            isCompact
            selectionBehavior='toggle'
            isHeaderSticky
            // searchingItemKey={["backupFiles"]}
        />

    );

}

export default BackupFiles;