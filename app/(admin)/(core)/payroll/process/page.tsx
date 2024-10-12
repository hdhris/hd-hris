"use client";
import Drawer from "@/components/common/Drawer";
import FormFields from "@/components/common/forms/FormFields";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import { Form } from "@/components/ui/form";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { axiosInstance } from "@/services/fetcher";
import { useQuery } from "@/services/queries";
import { PayrollTable } from "@/types/payroll/payrollType";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { Button, DateRangePicker, Link, Select, SelectItem } from "@nextui-org/react";
import { useDateFormatter } from "@react-aria/i18n";
import { AxiosResponse } from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaPen, FaPlus } from "react-icons/fa";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

function Page() {
  const [isAdding, setIsAdding] = useState(false);
  // const pageData = useQuery('');
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState("");
  const { data: payrollTable, isLoading:prtLoading } = useQuery<PayrollTable>(
    "/api/admin/payroll/process"
  );
  useEffect(() => {
    if (payrollTable) {
      setSelectedYear(toGMT8(payrollTable.pr_dates[0].start_date).format('YYYY'));
      setSelectedDate(String(payrollTable.pr_dates[0].id));
    }
  }, [payrollTable]);
  const [rangeValue, setRangeValue] = React.useState({
    start: parseDate("2024-04-01"),
    end: parseDate("2024-04-08"),
  });
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
          <Button {...uniformStyle({ color: "success" })} isIconOnly>
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
          {!payrollTable?.pr_dates.find((i)=>i.id===Number(selectedDate))?.is_processed &&
            <Link className="text-blue-500">Mark as processed</Link>
          }
          <p className="text-default-500 text-sm">
            {payrollTable?.pr_dates.find((i)=>i.id===Number(selectedDate))?.is_processed ? <span className="text-success">Proceessed</span>:'Processing'}
          </p>
          <Select
            aria-label="Date Picker"
            variant="bordered"
            // placeholder="Select an animal"
            items={
              payrollTable?.pr_dates.filter((item) => {
                const startYear = toGMT8(item.start_date).year();
                const endYear = toGMT8(item.end_date).year();
                return startYear === Number(selectedYear) || endYear === Number(selectedYear);
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
              ).map(year => ({ label: year.toString(), value: year })) || []
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
            onClick={() => {}}
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

  const payrollData = useMemo(() => {
    return axiosInstance
      .get<PayrollTable>(
        `/api/admin/payroll/process/${toGMT8(
          rangeValue.start.toDate(getLocalTimeZone())
        ).format("YYYY-MM-DD")},${toGMT8(
          rangeValue.end.toDate(getLocalTimeZone())
        ).format("YYYY-MM-DD")}`
      )
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error fetching payroll data:", error);
        return null; // or handle error state
      });
  }, [rangeValue]);

  const handleYearChange = (e: any) => {
    setSelectedYear(e.target.value);
    setSelectedDate(String(payrollTable?.pr_dates.filter((item)=>
      toGMT8(item.start_date).year() === Number(e.target.value)
    )[0].id));
  };

  const handleDateChange = (e: any) => {
    setSelectedDate(e.target.value);
  }

  let formatter = useDateFormatter({ dateStyle: "long" });
  return <div>Payroll Process</div>;
}

export default Page;

// export default function Test() {
//   const formSchema = z.object({
//     name: z.string(),
//     password: z.string(),
//   });
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "user12345",
//       password: "12345678",
//     },
//   });
//   // Wrap `handleSubmit` with `form.handleSubmit` to manage form submission
//   const handleSubmit = form.handleSubmit((values) => {
//     console.log(values);
//   });

//   return (
//     <Drawer isOpen onClose={() => {}} title="Test">
//       <Form {...form}>
//         <form id="drawer-form" onSubmit={(e) => {
//                                     e.preventDefault(); // Prevent page reload
//                                     handleSubmit(); // Handle form submission
//                                 }}>
//           <FormFields
//             items={[
//               { label: "Username", name: "name", type: "text" },
//               { label: "Password", name: "password", type: "password" },
//             ]}
//           />
//         </form>
//       </Form>
//     </Drawer>
//   );
// }
