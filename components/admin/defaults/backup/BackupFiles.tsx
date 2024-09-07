'use client'
import React, {useMemo} from 'react';
import TableData from "@/components/tabledata/TableData";
import {ColumnsProps, TableConfigProps} from "@/types/table/TableDataTypes";
import {useBackupLogs} from "@/services/queries";
import {BackupEntry} from "@/types/routes/default/types";
import {Case, Default, Switch} from "@/components/common/Switch";
import {Status} from "@/components/status/Status";
import {ChipProps, cn} from "@nextui-org/react";
import {LuDownload, LuRotateCcw, LuTrash2} from "react-icons/lu";
import {icon_size_sm} from "@/lib/utils";
import {Button} from "@nextui-org/button";


const tableColumns: ColumnsProps[] = [{
    name: 'Date', uid: 'date', sortable: true,
}, {name: 'Time', uid: 'time', sortable: true,}, {name: 'Type', uid: 'type', sortable: true,}, {
    name: 'Size', uid: 'size', sortable: true,
}, {name: 'Status', uid: 'status', sortable: true,}, {name: 'Action', uid: 'action'},]

const backupStatus: Record<string, ChipProps['color']> = {
    Completed: "success", Failed: "danger"
}

function BackupFiles() {
    const {data, isLoading} = useBackupLogs()

    const backupLogsData = useMemo(() => {
        if (data) {
            return data
        }
        return []
    }, [data])

    const TableEntry: TableConfigProps<BackupEntry> = {
        columns: tableColumns, rowCell: (item: BackupEntry, columnKey: React.Key) => {
            const cellValue = item[columnKey as keyof BackupEntry];
            return (<Switch expression={columnKey as string}>
                <Case of='status'>
                    <Status color={backupStatus[cellValue]}>{cellValue}</Status>
                </Case>
                <Case of='action'>
                    <div className='flex gap-2'>
                        <Button size='sm' variant='light' isIconOnly>
                            <LuDownload className={cn("text-default-400", icon_size_sm)}/>
                        </Button>
                        <Button size='sm' variant='light' isIconOnly>
                            <LuRotateCcw className={cn("text-default-400", icon_size_sm)}/>
                        </Button>
                        <Button size='sm' variant='light' isIconOnly>
                            <LuTrash2 className={cn("text-danger-400", icon_size_sm)}/>
                        </Button>
                    </div>
                </Case>
                <Default>
                    {cellValue}
                </Default>

            </Switch>)
        }
    }

    return (<TableData
            aria-label="User Table"
            config={TableEntry}
            // className='first:flex-1'
            classNames={{
                th: ['first:w-96 max-w-50'],
                tr: 'divide-x divide-gray-200',
                tbody: 'divide-y divide-gray-200'
            }}
            isLoading={isLoading}
            items={backupLogsData}
            removeWrapper
            // isStriped
            isCompact
            selectionBehavior='toggle'
            isHeaderSticky
            // searchingItemKey={["backupFiles"]}
        />

    );

}

export default BackupFiles;