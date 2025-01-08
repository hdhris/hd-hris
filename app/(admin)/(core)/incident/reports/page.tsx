"use client";
import {
  searchConfig,
  sortProps,
  tableConfig,
} from "@/components/admin/incident/reports/configs";
import IncidentDrawer from "@/components/admin/incident/reports/incident-drawer";
import DataDisplay from "@/components/common/data-display/data-display";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { useQuery } from "@/services/queries";
import { IncidentReport } from "@/types/incident-reports/type";
import { Button } from "@nextui-org/react";
import React, { useState } from "react";
import FileReport from "./FileReport";
import TableData from "@/components/tabledata/TableData";
import DataTable from "@/components/common/data-display/data-table";

function Page() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IncidentReport | null>(null);
  const { data, isLoading } = useQuery<IncidentReport[]>("/api/admin/incident/payroll");
  SetNavEndContent(() => {
    return (
      <>
        <Button {...uniformStyle()} onPress={() => setIsOpen(true)}>
          Report Incident
        </Button>
      </>
    );
  });

  return (
    <>
       <DataDisplay
        title="Incident Reports"
        data={data || []}
        isLoading={isLoading}
        searchProps={searchConfig}
        sortProps={sortProps}
        onTableDisplay={{
          config: tableConfig,
          classNames: { td: "[&:nth-child(n):not(:nth-child(1))]:w-[165px]" },
          layout: "auto",
          // onRowAction: (key) => {
          //   const item = data?.find((item) => item.id === Number(key));
          //   setSelectedItem(item!);
          //   // console.log(item);
          //   setOpen(true);
          // },
        }}
        defaultDisplay="table"
        paginationProps={{
          data_length: data?.length || 0,
        }}
      />

      {/* <IncidentDrawer
        selected={selectedItem}
        isOpen={open}
        onClose={(b)=>{setOpen(b); setTimeout(()=>{
          setSelectedItem(null);
        },500)}}
        // isSubmitting={false}
      /> */}
      <FileReport
        isOpen={isOpen}
        onClose={()=> setIsOpen(false)}
      />
    </>
  );
}
export default Page;
