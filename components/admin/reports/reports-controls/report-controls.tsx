"use client";
import React, { useEffect, useState } from 'react';
import {
    Button,
    DateRangePicker,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@nextui-org/react";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { LuPrinter } from "react-icons/lu";
import { BsFileEarmarkPdf } from 'react-icons/bs';
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import DepartmentSelection
    from "@/components/admin/reports/reports-controls/departments-selection/department-selection";
import { useControl } from "@/components/admin/reports/reports-controls/provider/reports-control-provider";
import { normalizeCalendarDateToDate } from "@/lib/utils/normalizeCalendarDateToDate";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { DateStyle } from "@/lib/custom/styles/InputStyle";

function ReportControls() {
    const { setIsGenerated, updateValue, value: prevValue } = useControl();

    return (
        <div className="flex gap-2 items-start w-[550px]">
            <DepartmentSelection />
            <DateRangePicker
                aria-label="Date Range"
                variant="bordered"
                radius="sm"
                classNames={DateStyle}
                size="sm"
                showMonthAndYearPickers
                hideTimeZone
                maxValue={today(getLocalTimeZone())}
                color="default"
                labelPlacement="outside"
                visibleMonths={2}
                defaultValue={{
                    start: today(getLocalTimeZone()),
                    end: today(getLocalTimeZone()),
                }}
                onChange={(value) => {
                    if (value) {
                        const start = normalizeCalendarDateToDate(value.start as CalendarDate);
                        const end = normalizeCalendarDateToDate(value.end as CalendarDate);
                        updateValue({
                            department: prevValue.department,
                            date: {
                                start: toGMT8(start).toISOString(),
                                end: toGMT8(end).toISOString(),
                            },
                        });
                    }
                }}
            />
            <Button
                {...uniformStyle()}
                onPress={() => setIsGenerated(true)}
            >
                Generate
            </Button>
            <Dropdown>
                <DropdownTrigger>
                    <Button {...uniformStyle()}>
                        Export
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    disallowEmptySelection
                    aria-label="Multiple selection example"
                    variant="flat"
                >
                    <DropdownItem key="print" startContent={<LuPrinter />}>Print</DropdownItem>
                    <DropdownItem key="pdf"
                                  startContent={<BsFileEarmarkPdf className="text-danger-500" />}>PDF</DropdownItem>
                    <DropdownItem key="csv"
                                  startContent={<PiMicrosoftExcelLogoFill className="text-success-500" />}>CSV</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}

export default ReportControls;
