"use client";
import { TableActionButton } from '@/components/actions/ActionButton';
import TableData from '@/components/tabledata/TableData';
import { toast } from '@/components/ui/use-toast';
import showDialog from '@/lib/utils/confirmDialog';
import { useEarnings } from '@/services/queries';
import { Payhead } from '@/types/payroll/payrollType';
import { TableConfigProps } from '@/types/table/TableDataTypes';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/dist/client/components/navigation';
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
  const router = useRouter();
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
            <p>{item.dim_payhead_affecteds?.length} employees</p>
          );
        case "action":
          return (
            <TableActionButton
              name={item.name}
              onEdit={()=>router.push(`/payroll/earnings/${item.id}`)}
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
    <TableData
        config={config}
        items={data!}
        isLoading={isLoading}
        searchingItemKey={["name"]}
        counterName='Earnings'
        className="flex-1 h-[calc(100vh-9.5rem)] overflow-y-auto"
        removeWrapper
        isHeaderSticky
        color={"primary"}
        selectionMode="single"
        aria-label="Earnings"
        endContent={()=><Button className=' w-fit' onClick={()=>router.push('/payroll/earnings/add')}>Add earning</Button>}
      />
    </>
  )
}

export default Page