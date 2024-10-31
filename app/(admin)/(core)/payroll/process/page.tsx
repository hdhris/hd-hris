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
        // case "action":
        //   return item.status === "pending" ? (
        //     <div className="flex gap-1 items-center">
        //       <Button
        //         isIconOnly
        //         variant="flat"
        //         isLoading={
        //           isPending.id === item.id && isPending.method === "rejected"
        //         }
        //         {...uniformStyle({ color: "danger" })}
        //         onClick={async () => {
        //           const result = await onUpdate({
        //             ...item,
        //             approved_at: toGMT8().toISOString(),
        //             updated_at: toGMT8().toISOString(),
        //             approved_by: userID!,
        //             status: "rejected",
        //             rate_per_hour: "0",
        //           });
        //         }}
        //       >
        //         <IoCloseSharp className="size-5 text-danger-500" />
        //       </Button>
        //       <Button
        //         {...uniformStyle({ color: "success" })}
        //         isLoading={
        //           isPending.id === item.id && isPending.method === "approved"
        //         }
        //         startContent={
        //           <IoCheckmarkSharp className="size-5 text-white" />
        //         }
        //         className="text-white"
        //         onClick={async () => {
        //           const result = await onUpdate({
        //             ...item,
        //             approved_at: toGMT8().toISOString(),
        //             updated_at: toGMT8().toISOString(),
        //             approved_by: userID!,
        //             status: "approved",
        //             rate_per_hour: String(
        //               item.trans_employees_overtimes.ref_job_classes.pay_rate
        //             ),
        //           });
        //         }}
        //       >
        //         Approve
        //       </Button>
        //     </div>
        //   ) : (
        //     <div className="flex justify-between w-36 items-center">
        //       <Chip
        //         startContent={
        //           item.status === "approved" ? (
        //             <FaCheckCircle size={18} />
        //           ) : (
        //             <IoMdCloseCircle size={18} />
        //           )
        //         }
        //         variant="flat"
        //         color={statusColorMap[item.status]}
        //         className="capitalize"
        //       >
        //         {item.status}
        //       </Chip>
        //       {item.trans_employees_overtimes_approvedBy && (
        //         <Tooltip className="pointer-events-auto" content={item.approvedBy_full_name}>
        //           <Avatar
        //           isBordered
        //           radius="full"
        //           size="sm"
        //           src={
        //             item?.trans_employees_overtimes_approvedBy?.picture ?? ""
        //           }
        //         />
        //         </Tooltip>
        //       )}
        //     </div>
        //   );
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
              value: emp.ref_job_classes.id,
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
