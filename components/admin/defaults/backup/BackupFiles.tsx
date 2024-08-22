'use client'
import React from 'react';
import {BadgeProps} from "@nextui-org/react";
import Text from "@/components/Text";
import TableData from "@/components/tabledata/TableData";
import {ColumnsProps, TableConfigProps} from "@/types/table/TableDataTypes";
import {backupData, TableProps} from "@/sampleData/admin/defaults/backup/backupData";
import {ActionButtons} from "@/components/actions/ActionButton";


const tableColumns: ColumnsProps[] = [{name: 'Backup Files', uid: 'backupFiles'}, {
    name: 'Timestamps', uid: 'timestamps'
}, {name: 'Destination', uid: 'destination'}, {name: 'Status', uid: 'status'},]

const department_status_color_map: Record<string, BadgeProps["color"]> = {
    active: "success", inactive: "danger",
}

function BackupFiles() {
    const TableEntry: TableConfigProps<TableProps> = {
        columns: tableColumns, rowCell: (item: TableProps, columnKey: React.Key) => {
            const cellValue = item[columnKey as keyof TableProps];
            return (<Text>{String(cellValue)}</Text>)
        }
    }

    return (<div className='h-80'>
            <TableData
                aria-label="User Table"
                config={TableEntry}
                items={backupData}
                removeWrapper
                isStriped
                isCompact
                selectionBehavior='toggle'
                selectionMode="multiple"
                isHeaderSticky
                searchingItemKey={["backupFiles"]}
            />
            <ActionButtons label='Restore'/>
        </div>

    );

}

export default BackupFiles;