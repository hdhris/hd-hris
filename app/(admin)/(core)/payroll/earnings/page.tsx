'use client'
import { TableActionButton } from '@/components/actions/ActionButton';
import TableData from '@/components/tabledata/TableData';
import { toast } from '@/components/ui/use-toast';
import showDialog from '@/lib/utils/confirmDialog';
import { useEarnings } from '@/services/queries';
import { Payhead } from '@/types/payroll/payrollType';
import { TableConfigProps } from '@/types/table/TableDataTypes';
import React, { useState } from 'react'


const handleDelete = async (id: Number, name: string) => {
    try {
      const result = await showDialog(
        "Confirm Delete",
        `Are you sure you want to delete '${name}'?`,
        false
      );
      if (result === "yes") {
        toast({
          title: "Delete Earning",
          description: "Earning deleted successfully!",
          variant: "primary",
        });
      }
    } catch (error) {
      toast({
        title: "Delete Earning",
        description: "Error deleteing earning: " + error,
        variant: "danger",
      });
    }
  };

function Page() {
  const { data, isLoading } = useEarnings();
  const config: TableConfigProps<Payhead> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "affected", name: "Affected", sortable: true },
      { uid: "action", name: "Action", sortable: true },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <p className='capitalize'>{item.name}</p>
          );
        case "affected":
          return (
            <p># of employees</p>
          );
        case "actions":
          return (
            <TableActionButton
              name={item.name}
              onEdit={() => alert(item.id)}
              onDelete={() => {
                handleDelete(item.id,item.name)
              }}
            />
          );
        default:
          return <></>;
      }
    },
  };
  return (
    <>
    <div>Earnings</div>
    <TableData
        config={config}
        items={data!}
        isLoading={isLoading}
        className="flex-1 h-[calc(100vh-9.5rem)] overflow-y-auto"
        removeWrapper
        isHeaderSticky
        color={"primary"}
        selectionMode="single"
        aria-label="Earnings"
        // onRowAction={(key) => {
        //   setSelectedKey(key as any);
        // }}
      />
    </>
  )
}

export default Page