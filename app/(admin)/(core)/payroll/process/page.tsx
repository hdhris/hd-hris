"use client";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { Button, DateRangePicker, Select, SelectItem } from "@nextui-org/react";
import { useDateFormatter } from "@react-aria/i18n";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";

function Page() {
  const [isAdding, setIsAdding] = useState(false);
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
            onChange={setRangeValue}
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
          <Select
            aria-label="Date Picker"
            variant="bordered"
            // placeholder="Select an animal"
            disallowEmptySelection
            selectedKeys={[selectedValue]}
            className="w-36"
            {...uniformStyle()}
            onChange={handleSelectionChange}
          >
            <SelectItem key={"oct2-2024"}>Oct 1 - 15</SelectItem>
            <SelectItem key={"oct1-2024"}>Oct 16 - 31</SelectItem>
          </Select>
          <Select
            aria-label="Year Picker"
            variant="bordered"
            // placeholder="Select an animal"
            disallowEmptySelection
            selectedKeys={[selectedValue]}
            className="w-28"
            {...uniformStyle()}
            onChange={handleSelectionChange}
          >
            <SelectItem key={"oct2-2024"}>2023</SelectItem>
            <SelectItem key={"oct1-2024"}>2024</SelectItem>
          </Select>
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
  const handleSelectionChange = (e: any) => {
    setSelectedValue(e.target.value);
  };
  const [selectedValue, setSelectedValue] = React.useState("");
  const [rangeValue, setRangeValue] = React.useState({
    start: parseDate("2024-04-01"),
    end: parseDate("2024-04-08"),
  });
  let formatter = useDateFormatter({ dateStyle: "long" });
  return <div>Payroll Process</div>;
}

export default Page;
