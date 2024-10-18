"use client";
import HolidayForm from "@/components/admin/attendance-time/holidays/HolidayForm";
import Drawer from "@/components/common/Drawer";
import DropdownList from "@/components/common/Dropdown";
import { FilterItemsProps } from "@/components/common/filter/FilterItems";
import SearchFilter from "@/components/common/filter/SearchFilter";
import { SearchItemsProps } from "@/components/common/filter/SearchItems";
import GridCard from "@/components/common/grid/GridCard";
import GridList from "@/components/common/grid/GridList";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import Loading from "@/components/spinner/Loading";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { useAxiosGet } from "@/lib/utils/axiosGetPost";
import { getSimilarityPercentage } from "@/lib/utils/similarityPercentage";
import { toGMT8 } from "@/lib/utils/toGMT8";
import {
  HolidayData,
  HolidayEvent,
  TransHoliday,
} from "@/types/attendance-time/HolidayTypes";
import { Button } from "@nextui-org/react";
import React, { useMemo, useState } from "react";
import { IoChevronDown } from "react-icons/io5";

function Page() {
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(toGMT8().get("year"));
  const [selectedItem, setSelectedItem] = useState<HolidayEvent | null>(null);
  const { data, isLoading, setApi } = useAxiosGet<HolidayData>(
    `/api/admin/attendance-time/holidays/${selectedYear}`
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
            data?.distinctYears.map((year) => ({
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
            setApi(`/api/admin/attendance-time/holidays/${String(key)}`)
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
            id={item.id}
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
        transItem={findByDateAndName(data, selectedItem)}
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
  },
];
const searchConfig: SearchItemsProps<HolidayEvent>[] = [
  { key: "name", label: "Name" },
  { key: "start_date", label: "Date" },
  { key: "type", label: "Type" },
];


function findByDateAndName(data: any, selectedItem: any): TransHoliday | null {
  if (!data?.transHolidays || !selectedItem) return null;

  // First: Try to find by date (MM-DD format)
  const foundByDate = data.transHolidays.filter(
    (th: any) => toGMT8(th.date).format('MM-DD') === toGMT8(selectedItem?.created_at).format('MM-DD')
  );

  // If found by date, check name similarity
  if (foundByDate) {
    let bestNameMatch: TransHoliday | null = null;
    let highestNamePercentage = 0;
    foundByDate.forEach((fbd: any)=> {
      const percentage = getSimilarityPercentage(fbd.name, selectedItem.name);
      if (percentage > 80 && percentage > highestNamePercentage) {
        highestNamePercentage = percentage;
        bestNameMatch = fbd;
      }
    })
    // const nameSimilarity = getSimilarityPercentage(foundByDate.name, selectedItem.name);
    // console.log("Find by date:",foundByDate.name, selectedItem.name, nameSimilarity)
    // If similarity is above 50%, return the found item
    if (highestNamePercentage > 50) {
      // return foundByDate;
      return bestNameMatch;
    }

    // If similarity is too low (< 50%), find another by name with 70% similarity
    let bestMatch: TransHoliday | null = null;
    let highestPercentage = 0;

    data.transHolidays.forEach((th: any) => {
      const percentage = getSimilarityPercentage(th.name, selectedItem.name);
      // console.log("Find by name: ",th.name, selectedItem.name, percentage)
      if (percentage > 75 && percentage > highestPercentage) {
        highestPercentage = percentage;
        bestMatch = th;
      }
    });

    // Return best match if found, otherwise null
    return bestMatch || null;
  }

  // If no match by date, fallback to finding a similar name with 80% threshold
  let bestNameMatch: TransHoliday | null = null;
  let highestNamePercentage = 0;

  data.transHolidays.forEach((th: any) => {
    const percentage = getSimilarityPercentage(th.name, selectedItem.name);
      // console.log("No date; Find by name: ",th.name, selectedItem.name, percentage)
      if (percentage > 80 && percentage > highestNamePercentage) {
      highestNamePercentage = percentage;
      bestNameMatch = th;
    }
  });

  // Return best match by name or null if no match
  return bestNameMatch || null;
}