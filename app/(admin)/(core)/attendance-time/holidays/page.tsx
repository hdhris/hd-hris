"use client";
import HolidayForm from "@/components/admin/attendance-time/holidays/HolidayForm";
import DropdownList from "@/components/common/Dropdown";
import { FilterItemsProps } from "@/components/common/filter/FilterItems";
import SearchFilter from "@/components/common/filter/SearchFilter";
import { SearchItemsProps } from "@/components/common/filter/SearchItems";
import GridCard from "@/components/common/grid/GridCard";
import GridList from "@/components/common/grid/GridList";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import Loading from "@/components/spinner/Loading";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import {
  HolidayData,
  HolidayEvent,
  TransHoliday,
} from "@/types/attendance-time/HolidayTypes";
import { Button } from "@nextui-org/react";
import React, { useState } from "react";
import { IoChevronDown } from "react-icons/io5";

function Page() {
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(toGMT8().get("year"));
  const [selectedItem, setSelectedItem] = useState<HolidayEvent | null>(null);
  const { data, isLoading } = useQuery<HolidayData>(
    `/api/admin/attendance-time/holidays/${selectedYear}`, {refreshInterval: 3000}
  );
  const [holidayItems, setHolidayItems] = useState<HolidayEvent[]>([]);

  SetNavEndContent(() => {
    return (
      <>
        <SearchFilter
          items={data?.combinedHolidays || []}
          filterConfig={filterConfig}
          searchConfig={searchConfig}
          setResults={setHolidayItems}
          isLoading={isLoading}
        />
        <DropdownList
          selectionMode="single"
          selectedKeys={new Set([String(selectedYear)])}
          onSelectionChange={(key) =>
            setSelectedYear(Number(Array.from(key)[0]))
          }
          items={
            data?.yearsArray.map((year) => ({
              label: String(year),
              key: String(year),
            })) || []
          }
          trigger={{
            label: (
              <p className="font-semibold text-blue-500">{selectedYear}</p>
            ),
            props: {
              ...uniformStyle({ color: "default", radius: "md" }),
              variant: "bordered",
              endContent: <IoChevronDown />,
            },
          }}
          onAction={(key) =>
            setSelectedYear(Number(key))
            // setApi(`/api/admin/attendance-time/holidays/${String(key)}`)
          }
        />
        <Button
          {...uniformStyle()}
          onClick={() => {
            setSelectedItem(null);
            setOpen(true);
          }}
        >
          Create Holiday
        </Button>
      </>
    );
  });

  if (isLoading) {
    return <Loading />;
  }
  return (
    <div className="h-full">
      <GridList items={holidayItems || []}>
        {(item) => (
          <GridCard
            id={item.id!}
            name={item.name}
            size="sm"
            onPress={() => {
              setSelectedItem(item);
              setOpen(true);
            }}
            items={[
              {
                column: "date",
                label: "Date",
                value: new Date(item.start_date),
              },
              {
                column: "type",
                label: "Type",
                value: item.type,
                textColor:
                  item.type === "Public Holiday"
                    ? "text-blue-500"
                    : item.type === "Private Holiday"
                    ? "text-pink-500"
                    : "text-gray-800",
              },
            ]}
            status={(() => {
              const start = toGMT8(item.start_date);
              const now = toGMT8();
              const status: "Upcoming" | "Ongoing" | "Completed" = start.isSame(
                now,
                "day"
              )
                ? "Ongoing"
                : start.isAfter(now)
                ? "Upcoming"
                : "Completed";
              return {
                label: status,
                color:
                  status === "Upcoming"
                    ? "orange"
                    : status === "Ongoing"
                    ? "success"
                    : "gray",
              };
            })()}
            deadPulse={!toGMT8(item.start_date).isSame(toGMT8(), "day")}
          />
        )}
      </GridList>
      <HolidayForm
        isOpen={open}
        onClose={() => {
          setOpen(false);
        }}
        selectedItem={selectedItem}
        transHolidays={data?.transHolidays || []}
      />
    </div>
  );
}

export default Page;

const filterConfig: FilterItemsProps<HolidayEvent>[] = [
  {
    filter: [
      {
        label: "Private",
        value: "Private Holiday",
      },
      {
        label: "Public",
        value: "Public Holiday",
      },
      {
        label: "Observance",
        value: "Observance",
      },
    ],
    key: "type",
    sectionName: "Type",
    selectionMode: "multipleOR"
  },
  {
    filter: [
      {
        label: "Ongoing",
        value: (item: HolidayEvent) => {
          return toGMT8(item.start_date).isSame(toGMT8());
        },
      },
      {
        label: "Upcoming",
        value: (item: HolidayEvent) => {
          return toGMT8(item.start_date).isAfter(toGMT8());
        },
      },
      {
        label: "Completed",
        value: (item: HolidayEvent) => {
          return toGMT8(item.start_date).isBefore();
        },
      },
    ],
    key: "start_date",
    sectionName: "Status",
    selectionMode: "single",
  },
];
const searchConfig: SearchItemsProps<HolidayEvent>[] = [
  { key: "name", label: "Name" },
  { key: "start_date", label: "Date" },
  { key: "type", label: "Type" },
];
