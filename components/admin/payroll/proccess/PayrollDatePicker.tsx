import { toGMT8 } from "@/lib/utils/toGMT8";
import { getLocalTimeZone, parseDate } from "@internationalized/date";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDateFormatter } from "@react-aria/i18n";
import { Button, DateRangePicker, Select, SelectItem, SharedSelection } from "@nextui-org/react";
import { toast } from "@/components/ui/use-toast";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import showDialog from "@/lib/utils/confirmDialog";
import { ProcessDate } from "@/types/payroll/payrollType";
import { useQuery } from "@/services/queries";
import { TbReload } from "react-icons/tb";

interface DatePickerUiProps {
    setProcessDate: (item: ProcessDate | false) => void;
    onDeploy?: () => void;
}

function DatePickerPayroll({ setProcessDate, onDeploy }: DatePickerUiProps) {
    let formatter = useDateFormatter({ dateStyle: "long" });
    const {
        data: payrollDates,
        isLoading,
        mutate,
    } = useQuery<ProcessDate[]>("/api/admin/payroll/get-process-dates", {
        refreshInterval: 5000,
        // refreshInterval: 0,
        // refreshWhenHidden: false,
        // refreshWhenOffline: false,
        // revalidateIfStale: false,
        // revalidateOnFocus: false,
        // // revalidateOnMount: false,
        // revalidateOnReconnect: false,
    });
    const [selectedYear, setSelectedYear] = React.useState("");
    const [selectedDate, setSelectedDate] = React.useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rangeValue, setRangeValue] = React.useState({
        start: parseDate(toGMT8().format("YYYY-MM-DD")),
        end: parseDate(toGMT8().format("YYYY-MM-DD")),
    });
    const handleYearChange = useCallback(
        (key: SharedSelection) => {
            const year = Array.from(key)[0].toString();
            setSelectedYear(year);
            setSelectedDate(String(payrollDates?.find((pd) => toGMT8(pd.start_date).year() === Number(year))?.id));
        },
        [payrollDates]
    );

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
            const year = toGMT8(payrollDates[0]?.start_date).format("YYYY");
            if (selectedDate == "" || selectedYear != year) setSelectedDate(String(payrollDates[0]?.id));
            setSelectedYear(year);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payrollDates]);
    
    useEffect(() => {
        setProcessDate(false)
    }, [getProcessDate, setProcessDate]);

    const load = useCallback(() => {
        if (getProcessDate){
          setProcessDate(getProcessDate)
        } else {
          setProcessDate(false)
        }
    }, [getProcessDate, setProcessDate]);

    async function handleAddDate() {
        try {
            setIsSubmitting(true);
            await axios.post("/api/admin/payroll/process/add-date", {
                start_date: toGMT8(rangeValue.start.toDate(getLocalTimeZone())).toISOString(),
                end_date: toGMT8(rangeValue.end.toDate(getLocalTimeZone())).toISOString(),
            });
            mutate();
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
        setIsSubmitting(false);
    }
    async function handleDeleteDate() {
        try {
            const response = await showDialog({
                title: "Delete",
                message: "Are you sure to delete this date process?",
                preferredAnswer: "no",
            });
            if (response === "yes") {
                setIsSubmitting(true);
                await axios.post("/api/admin/payroll/process/delete-date", {
                    id: Number(selectedDate),
                });
                mutate();
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
        setIsSubmitting(false);
    }
    async function handleDeploy() {
        // onDeploy && onDeploy();
        // return;
        const result = await showDialog({
            title: "Deploy Payroll",
            message: "This action can't be undone",
            preferredAnswer: "no",
        });
        if (!(result === "yes")) return;
        try {
            setIsSubmitting(true);
            onDeploy && onDeploy();
            await axios.post("/api/admin/payroll/process/update-date", {
                id: Number(selectedDate),
            });
            mutate();
            toast({
                title: "Proccessed",
                description: "Date has been marked proccessed!",
                variant: "success",
            });
            // onDeploy && onDeploy();
        } catch (error) {
            toast({
                title: "Error marking",
                description: String(error),
                variant: "danger",
            });
        }
        setIsSubmitting(false);
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
                            if(value) setRangeValue(value);
                            // console.log(value);
                        }}
                        {...uniformStyle({ color: "default" })} //Fixed: 'variant' is specified more than once, so this usage will be overwritten.
                        className="w-fit h-fit"
                        variant="bordered"
                    />
                    <Button
                        {...uniformStyle({ color: "success" })}
                        isIconOnly
                        onPress={handleAddDate}
                        isLoading={isLoading || isSubmitting}
                    >
                        <IoCheckmarkSharp className="size-5 text-white" />
                    </Button>
                    <Button
                        {...uniformStyle({ color: "danger", variant:"flat" })} //Fixed: 'variant' is specified more than once, so this usage will be overwritten.
                        isIconOnly
                        isLoading={isLoading || isSubmitting}
                        onPress={() => setIsAdding(false)}
                    >
                        <IoCloseSharp className="size-5 text-danger-500" />
                    </Button>
                </>
            ) : (
                <>
                    {payrollDates && payrollDates.length > 0 && !getProcessDate?.is_processed && !isLoading && onDeploy && (
                        <Button
                            {...uniformStyle()}
                            className="bg-blue-500"
                            onPress={handleDeploy}
                            isLoading={isLoading || isSubmitting}
                        >
                            Deploy now
                        </Button>
                    )}
                    {payrollDates && payrollDates.length > 0 && !isLoading && (
                        <p className="text-default-500 text-sm">
                            {getProcessDate?.is_processed ? (
                                <span className="text-success">Deployed</span>
                            ) : (
                                "Processing"
                            )}
                        </p>
                    )}
                    <Select
                        aria-label="Date Picker"
                        // placeholder="Select an animal"
                        items={
                            payrollDates?.filter((item) => {
                                const startYear = toGMT8(item.start_date).year();
                                const endYear = toGMT8(item.end_date).year();
                                return startYear === Number(selectedYear) || endYear === Number(selectedYear);
                            }) || []
                        }
                        isLoading={isLoading}
                        disallowEmptySelection
                        selectedKeys={new Set([selectedDate])}
                        className="w-36"
                        size="sm"
                        radius="sm"
                        color="primary"
                        variant="bordered" //Fixed: incompatible usage.
                        onSelectionChange={handleDateChange}
                    >
                        {(item) => (
                            <SelectItem key={item.id} className={item.is_processed ? "text-success-500" : ""}>{`${toGMT8(item.start_date).format("MMM DD")} - ${toGMT8(
                                item.end_date
                            ).format("MMM DD")}`}</SelectItem>
                        )}
                    </Select>
                    <Select // select a year
                        aria-label="Year Picker"
                        isLoading={isLoading}
                        items={
                            Array.from(new Set(payrollDates?.map((item) => toGMT8(item.start_date).year()))).map(
                                (year) => ({ label: year.toString(), value: year })
                            ) || []
                        }
                        disallowEmptySelection
                        selectedKeys={new Set([selectedYear])}
                        className="w-28"
                        size="sm"
                        radius="sm"
                        color="primary"
                        variant="bordered" //Fixed: incompatible usage.
                        onSelectionChange={handleYearChange}
                    >
                        {(item) => <SelectItem key={item.value}>{item.label}</SelectItem>}
                    </Select>
                    <Button // Load date
                        {...uniformStyle()}
                        isIconOnly
                        isLoading={isLoading || isSubmitting}
                        onPress={load}
                    >
                        <TbReload size={15} />
                    </Button>
                    <Button // Delete date
                        {...uniformStyle({ color: "danger" })}
                        isIconOnly
                        isLoading={isLoading || isSubmitting}
                        onPress={handleDeleteDate}
                    >
                        <MdDelete size={15} />
                    </Button>
                    <Button // Add date
                        {...uniformStyle()}
                        isIconOnly
                        isLoading={isLoading || isSubmitting}
                        onPress={() => setIsAdding(true)}
                    >
                        <FaPlus />
                    </Button>
                </>
            )}
        </div>
    );
}

export default DatePickerPayroll;
