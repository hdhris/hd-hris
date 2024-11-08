"use client";
import DatePickerPayroll from "@/components/admin/payroll/proccess/PayrollDatePicker";
import UserMail from "@/components/common/avatar/user-info-mail";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import TableData from "@/components/tabledata/TableData";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { useQuery } from "@/services/queries";
import { PayrollTable, ProcessDate } from "@/types/payroll/payrollType";
import { FilterProps } from "@/types/table/default_config";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Chip, Spinner } from "@nextui-org/react";
import React, { useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";

function Page() {
  // const pageData = useQuery('');

  const { data: payrollTable, isLoading } = useQuery<PayrollTable>(
    "/api/admin/payroll/process",
    { refreshInterval: 3000 }
  );
  // const [isLoading, setIsLoading] = useState(false);
  const [processDate, setProcessDate] = useState<ProcessDate>();
  SetNavEndContent(() => (
    <DatePickerPayroll
      setProcessDate={setProcessDate}
    />
  ));

  const [payrollData, setPayrollData] = useState<PayrollTable | null>(null);

  const config: TableConfigProps<PayrollTable["employees"][0]> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "gross", name: "Gross", sortable: true },
      { uid: "deduction", name: "Deduction", sortable: true },
      { uid: "net", name: "Net Salary", sortable: true },
      { uid: "action", name: "Action", sortable: true },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <UserMail
              name={getEmpFullName(item)}
              email={item.email}
              picture={item.picture}
            />
          );
        case "gross":
          return <p>####</p>;
        case "deduction":
          return <p>####</p>;
        case "net":
          return <p>####</p>;
        case "action":
          return (
            <Chip
              startContent={<IoMdCloseCircle size={18} />}
              variant="flat"
              color="danger"
              className="capitalize"
            >
              Uncalculated
            </Chip>
          );
        default:
          return <></>;
      }
    },
  };

  const filterItems: FilterProps[] = [
    {
      filtered:
        payrollTable?.employees
          ?.map((emp) => {
            return {
              name: emp.ref_job_classes.name,
              key: "ref_job_classes.id",
              value: emp.ref_job_classes.id!,
            };
          })
          ?.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.value === item.value)
          ) || [],
      category: "Roles",
    },
  ];

  if (isLoading || (processDate===undefined)) {
    return <Spinner label="Loading..." className="w-full h-full" />;
  }
  return (
    <div className="h-fit-navlayout">
      <TableData
        items={payrollTable?.employees || []}
        config={config}
        searchingItemKey={["first_name", "middle_name", "last_name"]}
        filterItems={filterItems}
        isHeaderSticky
        className="h-full"
        aria-label="Employee Payroll"
      />
    </div>
  );
}

export default Page;
