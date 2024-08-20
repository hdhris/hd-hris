import React from "react";
import { Calendar } from "@nextui-org/react";
import { parseDate } from "@internationalized/date";

export default function page() {
  return (
    <>
      <div>Records</div>
      <Calendar
        aria-label="Date (Uncontrolled)"
        defaultValue={parseDate("2020-02-03")}
      />
    </>
  );
}
