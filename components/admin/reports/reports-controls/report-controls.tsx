"use client";
import React, {useState} from 'react';
import {
    Button,
    DateRangePicker,
    DateValue,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@nextui-org/react";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {LuPrinter} from "react-icons/lu";
import {BsFileEarmarkPdf} from 'react-icons/bs';
import {PiMicrosoftExcelLogoFill} from "react-icons/pi";
import {CalendarDate, getLocalTimeZone, today} from "@internationalized/date";
import DepartmentSelection
    from "@/components/admin/reports/reports-controls/departments-selection/department-selection";
import {useControl} from "@/components/admin/reports/reports-controls/provider/reports-control-provider";
import {normalizeCalendarDateToDate} from "@/lib/utils/normalizeCalendarDateToDate";
import {toGMT8} from "@/lib/utils/toGMT8";
import {DateStyle} from "@/lib/custom/styles/InputStyle";
import Drawer from "@/components/common/Drawer";
import Typography, {Section} from "@/components/common/typography/Typography";
import {RangeValue} from "@react-types/shared";
import {useDateFormatter} from "@react-aria/i18n";

interface ReportControlsProps {
    allowMaxDate?: boolean,
    isDateRange?: boolean
}
function ReportControls({allowMaxDate, isDateRange = true, }: ReportControlsProps) {
    const { setIsGenerated, updateValue, value: prevValue } = useControl();
    const [dateRange, setDateRange] = useState<RangeValue<DateValue>>({
        start: today(getLocalTimeZone()),
        end: today(getLocalTimeZone()),
    })

    const [isOpen, setIsOpen] = useState<boolean>(false)
    let formatter = useDateFormatter({dateStyle: "long"});
    const handleOpen = () => setIsOpen(true)
    return (
        <div className="flex gap-2 items-center">

            <Typography className="text-sm flex gap-2"><span className="font-semibold text-sm">Your are generating:</span>
                <span className="underline">{`${toGMT8(dateRange.start.toDate(getLocalTimeZone())).format("MMM DD, YYYY")} - ${toGMT8(dateRange.end.toDate(getLocalTimeZone())).format("MMM DD, YYYY")}`}</span></Typography>
            <Button
                {...uniformStyle()}
                onPress={() => handleOpen()}
            >
                Generate
            </Button>
            {/*<Button*/}
            {/*    {...uniformStyle()}*/}
            {/*    onPress={() => setIsGenerated(true)}*/}
            {/*>*/}
            {/*    Generate*/}
            {/*</Button>*/}

            <Dropdown>
                <DropdownTrigger>
                    <Button {...uniformStyle({color: "default"})}>
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
            <Drawer isOpen={isOpen} onClose={setIsOpen}
                    isDismissible
                    title={
                <Section
                    className="ms-0"
                    title="Generate Report"
                    subtitle="Configure report parameters."
                />

            }
                    footer={
                        <Button
                            className="w-full"
                            {...uniformStyle()}
                            onPress={() => {
                                setIsGenerated(true)
                                setIsOpen(false)
                            }}
                        >
                            Generate Report
                        </Button>
                    }

            >
                <div className="flex flex-col gap-6">
                    <DepartmentSelection />
                    <DateRangePicker
                        aria-label="Date Range"
                        variant="bordered"
                        label="Select Date Range"
                        classNames={DateStyle}
                        showMonthAndYearPickers
                        hideTimeZone
                        maxValue={allowMaxDate ? undefined : today(getLocalTimeZone())}
                        color="default"
                        labelPlacement="outside"
                        visibleMonths={2}
                        value={dateRange}
                        onChange={(value) => {
                            if (value) {
                                const start = normalizeCalendarDateToDate(value.start as CalendarDate);
                                const end = normalizeCalendarDateToDate(value.end as CalendarDate);
                                setDateRange(value)
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
                </div>

            </Drawer>
        </div>
    );
}

export default ReportControls;
