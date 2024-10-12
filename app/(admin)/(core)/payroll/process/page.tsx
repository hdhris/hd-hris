"use client";
import UserMail from "@/components/common/avatar/user-info-mail";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import TableData from "@/components/tabledata/TableData";
import { toast } from "@/components/ui/use-toast";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import showDialog from "@/lib/utils/confirmDialog";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { axiosInstance } from "@/services/fetcher";
import { useQuery } from "@/services/queries";
import { PayrollTable } from "@/types/payroll/payrollType";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import {
  Button,
  Chip,
  DateRangePicker,
  Link,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useDateFormatter } from "@react-aria/i18n";
import axios, { AxiosResponse } from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaPen, FaPlus } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

function Page() {
  const [isAdding, setIsAdding] = useState(false);
  // const pageData = useQuery('');
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState("");
  const { data: payrollTable, isLoading: prtLoading } = useQuery<PayrollTable>(
    "/api/admin/payroll/process",
    3000
  );
  function getProcessDate() {
    return payrollTable?.pr_dates.find((i) => i.id === Number(selectedDate));
  }
  useEffect(() => {
    if (payrollTable) {
      setSelectedYear(
        toGMT8(payrollTable.pr_dates[0].start_date).format("YYYY")
      );
      setSelectedDate(String(payrollTable.pr_dates[0].id));
    }
  }, [payrollTable]);
  const [rangeValue, setRangeValue] = React.useState({
    start: parseDate("2024-12-01"),
    end: parseDate("2024-12-01"),
  });
  async function handleAddDate() {
    try {
      await axios.post("/api/admin/payroll/process/add-date", {
        start_date: toGMT8(
          rangeValue.start.toDate(getLocalTimeZone())
        ).toISOString(),
        end_date: toGMT8(
          rangeValue.end.toDate(getLocalTimeZone())
        ).toISOString(),
      });
      toast({
        title: "Added",
        description: "Date added successfully!",
        variant: "success",
      });
      setIsAdding(false);
    } catch (error) {
      toast({
        title: "Error adding",
        description: String(error),
        variant: "danger",
      });
    }
  }
  async function handleDeleteDate() {
    try {
      const response = await showDialog({
        title: "Delete",
        message: "Are you sure to delete this date process?",
        preferredAnswer: "no",
      });
      if (response === "yes") {
        await axios.post("/api/admin/payroll/process/delete-date", {
          id: Number(selectedDate),
        });
        toast({
          title: "Deleted",
          description: "Date deleted successfully!",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error deleting",
        description: String(error),
        variant: "danger",
      });
    }
  }
  SetNavEndContent(() => (
    <div className="flex gap-2 items-center">
      {isAdding ? (
        <>
          <p className="text-default-500 text-sm">
            {rangeValue
              ? formatter.formatRange(
                  rangeValue.start.toDate(getLocalTimeZone()),
                  rangeValue.end.toDate(getLocalTimeZone())
                )
              : "--"}
          </p>
          <DateRangePicker
            aria-label="Payroll Range"
            value={rangeValue}
            onChange={(value) => {
              setRangeValue(value);
              console.log(value);
            }}
            {...uniformStyle({ color: "default" })}
            className="w-fit h-fit"
            variant="bordered"
          />
          <Button
            {...uniformStyle({ color: "success" })}
            isIconOnly
            onClick={handleAddDate}
          >
            <IoCheckmarkSharp className="size-5 text-white" />
          </Button>
          <Button
            variant="flat"
            {...uniformStyle({ color: "danger" })}
            isIconOnly
            onClick={() => setIsAdding(false)}
          >
            <IoCloseSharp className="size-5 text-danger-500" />
          </Button>
        </>
      ) : (
        <>
          {!getProcessDate()?.is_processed && (
            <Link className="text-blue-500 cursor-pointer" onClick={async ()=>{
              try {
                await axios.post("/api/admin/payroll/process/update-date", {
                  id: Number(selectedDate),
                });
                toast({
                  title: "Proccessed",
                  description: "Date has been marked proccessed!",
                  variant: "success",
                });
                setIsAdding(false);
              } catch (error) {
                toast({
                  title: "Error marking",
                  description: String(error),
                  variant: "danger",
                });
              }
            }}>
              Mark as processed
            </Link>
          )}
          <p className="text-default-500 text-sm">
            {getProcessDate()?.is_processed ? (
              <span className="text-success">Proceessed</span>
            ) : (
              "Processing"
            )}
          </p>
          <Select
            aria-label="Date Picker"
            variant="bordered"
            // placeholder="Select an animal"
            items={
              payrollTable?.pr_dates.filter((item) => {
                const startYear = toGMT8(item.start_date).year();
                const endYear = toGMT8(item.end_date).year();
                return (
                  startYear === Number(selectedYear) ||
                  endYear === Number(selectedYear)
                );
              }) || []
            }
            isLoading={prtLoading}
            disallowEmptySelection
            selectedKeys={[selectedDate]}
            className="w-36"
            {...uniformStyle()}
            onChange={handleDateChange}
          >
            {(item) => (
              <SelectItem key={item.id}>{`${toGMT8(item.start_date).format(
                "MMM DD"
              )} - ${toGMT8(item.end_date).format("MMM DD")}`}</SelectItem>
            )}
          </Select>
          <Select
            aria-label="Year Picker"
            variant="bordered"
            isLoading={prtLoading}
            items={
              Array.from(
                new Set(
                  payrollTable?.pr_dates.map((item) =>
                    toGMT8(item.start_date).year()
                  )
                )
              ).map((year) => ({ label: year.toString(), value: year })) || []
            }
            disallowEmptySelection
            selectedKeys={[selectedYear]}
            className="w-28"
            {...uniformStyle()}
            onChange={handleYearChange}
          >
            {(item) => <SelectItem key={item.value}>{item.label}</SelectItem>}
          </Select>
          <Button
            {...uniformStyle({ color: "danger" })}
            isIconOnly
            onClick={handleDeleteDate}
          >
            <MdDelete size={15} />
          </Button>
          <Button
            {...uniformStyle()}
            isIconOnly
            onClick={() => setIsAdding(true)}
          >
            <FaPlus />
          </Button>
        </>
      )}
    </div>
  ));

  const [payrollData, setPayrollData] = useState<PayrollTable | null>(null);
  useEffect(() => {
    const fetchPayrollData = async () => {
      // setLoading(true); // Start loading
      try {
        const response: AxiosResponse<PayrollTable> = await axiosInstance.get(
          `/api/admin/payroll/process/${toGMT8(
            getProcessDate()?.start_date
          ).format("YYYY-MM-DD")},${toGMT8(getProcessDate()?.end_date).format(
            "YYYY-MM-DD"
          )}`
        );
        setPayrollData(response.data);
      } catch (error) {
        console.error("Error fetching payroll data:", error);
        // setError("Failed to load payroll data.");
      } finally {
        // setLoading(false); // End loading
      }
    };

    fetchPayrollData(); // Fetch data when component mounts or `selectedDate` changes
  }, [selectedDate]);

  const handleYearChange = (e: any) => {
    setSelectedYear(e.target.value);
    setSelectedDate(
      String(
        payrollTable?.pr_dates.filter(
          (item) => toGMT8(item.start_date).year() === Number(e.target.value)
        )[0].id
      )
    );
  };

  const handleDateChange = (e: any) => {
    setSelectedDate(e.target.value);
  };

  let formatter = useDateFormatter({ dateStyle: "long" });

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
  return (
    <div className="h-fit-navlayout">
      <TableData
        items={payrollTable?.employees || []}
        config={config}
        isHeaderSticky
        className="h-full"
        aria-label="Employee Payroll"
      />
    </div>
  );
}

export default Page;
