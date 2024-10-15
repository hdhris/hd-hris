"use client";
import GridCard from "@/components/common/grid/GridCard";
import GridList from "@/components/common/grid/GridList";
import SearchItems from "@/components/common/SearchItems";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import Loading from "@/components/spinner/Loading";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { HolidayEvent } from "@/types/attendance-time/HolidayTypes";
import React, { useState } from "react";

function Page() {
  const [selectedYear, setSelectedYear] = useState(toGMT8().get("year"));
  const { data, isLoading } = useQuery<HolidayEvent[]>(
    `/api/admin/attendance-time/holidays/${selectedYear}`
  );
  const [searchedItems, setSearchedItems] = useState<HolidayEvent[]>([]);
  SetNavEndContent(() => {
    return (
      <SearchItems
        items={data || []}
        config={[
          { key: "name", label: "Name" },
          { key: "startDate", label: "Date" },
        ]}
        searchedItems={setSearchedItems}
      />
    );
  });

  if (isLoading) {
    return <Loading />;
  }
  return (
    <div className="h-full">
      <GridList items={searchedItems || []}>
        {(item) => (
          <GridCard
            name={item.name}
            size="sm"
            items={[
              {
                column: "date",
                label: "Date",
                value: toGMT8(item.startDate).format("MMM DD, YYYY"),
              },
              {
                column: "type",
                label: "Type",
                value: (
                  <p
                    className={
                      item.isPublicHoliday ? "text-blue-500" : "text-gray-800"
                    }
                  >
                    {item.isPublicHoliday ? "Public Holiday" : "Observance"}
                  </p>
                ),
              },
            ]}
            status={(() => {
              const start = toGMT8(item.startDate);
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
            deadPulse={!toGMT8(item.startDate).isSame(toGMT8())}
            actionList={[
              {
                label: "Edit",
                key: item.id,
                description: "Edit holiday",
                onClick: (key)=>alert("Edit: "+key),
              },
              {
                label: "Delete",
                key: item.id,
                description: "Delete holiday",
                onClick: (key)=>alert("Delete: "+key),
              },
            ]}
          />
        )}
      </GridList>
    </div>
  );
}

export default Page;
