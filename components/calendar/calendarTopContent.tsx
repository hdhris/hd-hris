import {ButtonGroup} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import {DateValue, getLocalTimeZone, startOfMonth, startOfWeek, today} from "@internationalized/date";
import React from "react";
import {useLocale} from "@react-aria/i18n";
interface CalendarTopContentProps {
    dateValue: (value: DateValue) => void
}
export const CalendarTopContent = ({dateValue}: CalendarTopContentProps) => {
    let defaultDate = today(getLocalTimeZone());
    let [value, setValue] = React.useState<DateValue>(defaultDate);
    let {locale} = useLocale();

    let now = today(getLocalTimeZone());
    let nextWeek = startOfWeek(now.add({weeks: 1}), locale);
    let nextMonth = startOfMonth(now.add({months: 1}));

    dateValue(value);
    return (
        <ButtonGroup
            fullWidth
            className="px-3 pb-2 pt-3 bg-content1 [&>button]:text-default-500 [&>button]:border-default-200/60"
            radius="full"
            size="sm"
            variant="bordered"
        >
            <Button onPress={() => setValue(now)}>Today</Button>
            <Button onPress={() => setValue(nextWeek)}>Next week</Button>
            <Button onPress={() => setValue(nextMonth)}>Next month</Button>
        </ButtonGroup>
    );
};