import { toGMT8 } from "@/lib/utils/toGMT8";
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import React, { useEffect, useMemo, useState } from "react";
import { useDateFormatter } from "@react-aria/i18n";
import {
  Button,
  DateRangePicker,
  Link,
  Select,
  SelectItem,
  SharedSelection,
} from "@nextui-org/react";
import { toast } from "@/components/ui/use-toast";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import showDialog from "@/lib/utils/confirmDialog";
import { ProcessDate } from "@/types/payroll/payrollType";
import { useQuery } from "@/services/queries";

interface DatePickerUiProps {
  setProcessDate: (item: ProcessDate)=>void;
}

function DatePickerPayroll({
  setProcessDate,
}: DatePickerUiProps) {
  let formatter = useDateFormatter({ dateStyle: "long" });
  const {data:payrollDates, isLoading} = useQuery<ProcessDate[]>('/api/admin/payroll/get-process-dates')
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [rangeValue, setRangeValue] = React.useState({
    start: parseDate(toGMT8().format("YYYY-MM-DD")),
    end: parseDate(toGMT8().format("YYYY-MM-DD")),
  });
  const handleYearChange = (key: SharedSelection) => {
    const year = Array.from(key)[0].toString();
    setSelectedYear(year);
    setSelectedDate(
      String(
        payrollDates?.filter(
          (item) => toGMT8(item.start_date).year() === Number(year)
        )[0].id
      )
    );
  };
  const handleDateChange = (key: SharedSelection) => {
    setSelectedDate(Array.from(key)[0].toString());
  };
  const getProcessDate = useMemo(() => {
    if (payrollDates && selectedDate) {
      return payrollDates?.find((i) => i.id === Number(selectedDate));
    }
  }, [payrollDates, selectedDate]);
  useEffect(() => {
    if (payrollDates) {
      setSelectedYear(toGMT8(payrollDates[0]?.start_date).format("YYYY"));
      setSelectedDate(String(payrollDates[0]?.id));
    }
  }, [payrollDates]);
  useEffect(() => {
    if (getProcessDate) setProcessDate(getProcessDate);
  }, [getProcessDate, setProcessDate]);
  
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

  return (
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
          {!getProcessDate?.is_processed && (
            <Link
              className="text-blue-500 cursor-pointer"
              onClick={async () => {
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
              }}
            >
              Mark as processed
            </Link>
          )}
          <p className="text-default-500 text-sm">
            {getProcessDate?.is_processed ? (
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
              payrollDates?.filter((item) => {
                const startYear = toGMT8(item.start_date).year();
                const endYear = toGMT8(item.end_date).year();
                return (
                  startYear === Number(selectedYear) ||
                  endYear === Number(selectedYear)
                );
              }) || []
            }
            isLoading={isLoading}
            disallowEmptySelection
            selectedKeys={new Set([selectedDate])}
            className="w-36"
            {...uniformStyle()}
            onSelectionChange={handleDateChange}
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
            isLoading={isLoading}
            items={
              Array.from(
                new Set(
                  payrollDates?.map((item) => toGMT8(item.start_date).year())
                )
              ).map((year) => ({ label: year.toString(), value: year })) || []
            }
            disallowEmptySelection
            selectedKeys={new Set([selectedYear])}
            className="w-28"
            {...uniformStyle()}
            onSelectionChange={handleYearChange}
          >
            {(item) => <SelectItem key={item.value}>{item.label}</SelectItem>}
          </Select>
          <Button
            {...uniformStyle({ color: "danger" })}
            isIconOnly
            isLoading={isLoading}
            onClick={handleDeleteDate}
          >
            <MdDelete size={15} />
          </Button>
          <Button
            {...uniformStyle()}
            isIconOnly
            isLoading={isLoading}
            onClick={() => setIsAdding(true)}
          >
            <FaPlus />
          </Button>
        </>
      )}
    </div>
  );
}

export default DatePickerPayroll;
