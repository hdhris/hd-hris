'use client'
import React, {Suspense} from 'react';
import {BadgeProps, Spinner} from "@nextui-org/react";
import Text from "@/components/Text";
import TableData from "@/components/tabledata/TableData";
import {ColumnsProps, TableConfigProps} from "@/types/table/TableDataTypes";
import BorderCard from "@/components/common/BorderCard";
import {backupData, TableProps} from "@/sampleData/admin/defaults/backup/backupData";


const tableColumns: ColumnsProps[] = [{name: 'Backup Files', uid: 'backupFiles'}, {
    name: 'Timestamps', uid: 'timestamps'
}, {name: 'Destination', uid: 'destination'}, {name: 'Status', uid: 'status'},]

const department_status_color_map: Record<string, BadgeProps["color"]> = {
    active: "success", inactive: "danger",
}

function DepartmentTable() {
    const TableEntry: TableConfigProps<TableProps> = {
        columns: tableColumns, rowCell: (item: TableProps, columnKey: React.Key) => {
            const cellValue = item[columnKey as keyof TableProps];
            return (<Text>{String(cellValue)}</Text>)
        }
    }

    return (<div className="h-full flex flex-col gap-2">
            <BorderCard heading="" className="w-full h-full overflow-hidden">
                <Suspense fallback={<Spinner/>}>
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
                </Suspense>
            </BorderCard>
        </div>


    );

}

export default DepartmentTable;