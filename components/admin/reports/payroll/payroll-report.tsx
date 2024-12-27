"use client"
import React, {useMemo} from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import ReportControls from "@/components/admin/reports/reports-controls/report-controls";
import ReportTable from "@/components/admin/reports/reports-controls/report-table";
import {usePayrollReport} from "@/services/queries";
import {Alert} from "@nextui-org/alert";
import {getKeyValue, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";

function PayrollReport() {

    const {data, isLoading} = usePayrollReport(4)
    const report = useMemo(() => {
        if(data) return data
    }, [data]);
    // SetNavEndContent(() => {
    //     return <ReportControls/>
    // })
    return (<div className="h-full">

        <></>
        {/*<Table*/}
        {/*    isHeaderSticky*/}
        {/*    aria-label="Reports Table"*/}
        {/*    // sortDescriptor={list.sortDescriptor}*/}
        {/*    // onSortChange={list.sort}*/}
        {/*    // topContent={*/}
        {/*    //     key[0] !== "undefined" && <Alert description={key[0]}/>*/}
        {/*    //*/}
        {/*    // }*/}
        {/*    // bottomContent={*/}
        {/*    //     hasMore ? (*/}
        {/*    //         <div className="flex w-full justify-center">*/}
        {/*    //             <Spinner ref={loaderRef} color="primary"/>*/}
        {/*    //         </div>*/}
        {/*    //     ) : null*/}
        {/*    // }*/}
        {/*    classNames={{*/}
        {/*        th: ["bg-white", "text-default-500", "border", "border-divider"],*/}
        {/*        td: ["text-default-500", "border", "border-divider", "w-96"],*/}
        {/*        base: "h-full",*/}
        {/*        emptyWrapper: "h-full",*/}
        {/*        loadingWrapper: "h-full",*/}
        {/*        wrapper: `pt-0 px-4 pb-4 bg-transparent rounded-none shadow-noneh-full`,*/}
        {/*    }}*/}
        {/*>*/}
        {/*    /!*<TableHeader columns={columns.columns}>*!/*/}
        {/*    /!*    {(column: { uid: any; name: string; sortable?: boolean }) => (<TableColumn*!/*/}
        {/*    /!*        key={column.uid}*!/*/}
        {/*    /!*        align={column.uid === "actions" ? "center" : "start"}*!/*/}
        {/*    /!*        allowsSorting={column.sortable}*!/*/}
        {/*    /!*        maxWidth={100}*!/*/}
        {/*    /!*    >*!/*/}
        {/*    /!*        {column.name.toUpperCase()}*!/*/}
        {/*    /!*    </TableColumn>)}*!/*/}
        {/*    /!*</TableHeader>*!/*/}
        {/*    /!*<TableBody*!/*/}
        {/*    /!*    isLoading={isLoading}*!/*/}
        {/*    /!*    items={}*!/*/}
        {/*    /!*    loadingContent={<Spinner color="danger"/>}*!/*/}
        {/*    /!*>*!/*/}
        {/*    /!*    {(item: T) => (*!/*/}
        {/*    /!*        <TableRow className="w-fit">*!/*/}
        {/*    /!*            {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}*!/*/}
        {/*    /!*        </TableRow>*!/*/}
        {/*    /!*    )}*!/*/}
        {/*    /!*</TableBody>*!/*/}
        {/*</Table>*/}

        {/*/!*<ReportTable endpoint="http://localhost:3000/api/admin/reports/payroll?date=4" columns={{*!/*/}
        {/*/!*    columns: [*!/*/}
        {/*/!*        {*!/*/}
        {/*/!*            uid: "id",*!/*/}
        {/*/!*            name: "ID",*!/*/}
        {/*/!*            sortable: true*!/*/}
        {/*/!*        },{*!/*/}
        {/*/!*            uid: "employee",*!/*/}
        {/*/!*            name: "Name",*!/*/}
        {/*/!*            sortable: true,*!/*/}
        {/*/!*        },{*!/*/}
        {/*/!*            uid: "department",*!/*/}
        {/*/!*            name: "Department",*!/*/}
        {/*/!*            sortable: true,*!/*/}
        {/*/!*        },{*!/*/}
        {/*/!*            uid: "timestamp",*!/*/}
        {/*/!*            name: "Timestamp"*!/*/}
        {/*/!*        },{*!/*/}
        {/*/!*            uid: "status",*!/*/}
        {/*/!*            name: "Status",*!/*/}
        {/*/!*        },{*!/*/}
        {/*/!*            uid: "punch",*!/*/}
        {/*/!*            name: "Punch",*!/*/}
        {/*/!*        }*!/*/}
        {/*/!*    ]*!/*/}
        {/*/!*}}/>*!/*/}


    </div>);
}

export default PayrollReport;