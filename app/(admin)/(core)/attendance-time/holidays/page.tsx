"use client";
import Drawer from "@/components/common/Drawer";
import GridCard from "@/components/common/grid/GridCard";
import GridList from "@/components/common/grid/GridList";
import SearchItems from "@/components/common/SearchItems";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import Loading from "@/components/spinner/Loading";
import { Form } from "@/components/ui/form";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { HolidayEvent } from "@/types/attendance-time/HolidayTypes";
import React, { useState } from "react";

function Page() {
  const [open, setOpen] = useState(false)
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
          { key: "start_date", label: "Date" },
        ]}
        setResults={setSearchedItems}
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
            id={item.id}
            name={item.name}
            size="sm"
            onPress={() => alert(item.id)}
            items={[
              {
                column: "date",
                label: "Date",
                value: new Date(item.start_date),
              },
              {
                column: "type",
                label: "Type",
                value: (
                  <p
                    className={
                      item.type === "Public Holiday"
                        ? "text-blue-500"
                        : item.type === "Private Holiday"
                        ? "text-pink-500"
                        : "text-gray-800"
                    }
                  >
                    {item.type}
                  </p>
                ),
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
            deadPulse={toGMT8(item.start_date).get('date')!= toGMT8().get('date')}
          />
        )}
      </GridList>
      {/* <Drawer isOpen isDismissible onClose={setOpen}>
        <Form>
          <form>

          </form>
        </Form>
      </Drawer> */}
    </div>
  );
}

export default Page;
