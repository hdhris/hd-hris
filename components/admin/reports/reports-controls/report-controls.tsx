
import React from 'react';
import {
    Button,
    DateRangePicker,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Select,
    SelectItem
} from "@nextui-org/react";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {LuPrinter} from "react-icons/lu";
import {BsFileEarmarkPdf} from 'react-icons/bs';
import {PiMicrosoftExcelLogoFill} from "react-icons/pi";
import {TbDatabaseExport} from "react-icons/tb";
import {icon_size_sm} from "@/lib/utils";
import {DateStyle} from "@/lib/custom/styles/InputStyle";
import {getLocalTimeZone, today} from "@internationalized/date";
import DepartmentSelection
    from "@/components/admin/reports/reports-controls/departments-selection/department-selection";

function ReportControls() {
    return (
        <div className="flex gap-2 items-start w-[550px]">
            <DepartmentSelection/>
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
            />
            <Button {...uniformStyle()}>Generate</Button>
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
                    <DropdownItem key="print" startContent={<LuPrinter/>}>Print</DropdownItem>
                    <DropdownItem key="pdf"
                                  startContent={<BsFileEarmarkPdf className="text-danger-500"/>}>PDF</DropdownItem>
                    <DropdownItem key="csv"
                                  startContent={<PiMicrosoftExcelLogoFill className="text-success-500"/>}>CSV</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}

export default ReportControls;