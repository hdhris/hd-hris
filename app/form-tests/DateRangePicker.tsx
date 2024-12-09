"use client"
import React from 'react';
import {
    useForm,
    Controller,
    ControllerRenderProps,
    FieldValues
} from 'react-hook-form';
import { DateRangePicker } from '@nextui-org/react';
import {
    parseDate,
    getLocalTimeZone,
    DateValue, parseZonedDateTime
} from '@internationalized/date';
import { useDateFormatter } from '@react-aria/i18n';
import type { RangeValue } from '@react-types/shared';

// Define the form input type
interface DateRangeFormInputs {
    dateRange: RangeValue<DateValue>;
}

const DateRangePickerForm: React.FC = () => {
    // Set up react-hook-form
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<DateRangeFormInputs>({
        defaultValues: {
            dateRange: {
                start: parseZonedDateTime("2024-04-01T00:45[America/Los_Angeles]"),
                end: parseZonedDateTime("2024-04-14T11:15[America/Los_Angeles]"),
            }
        }
    });

    // Date formatter for display
    const formatter = useDateFormatter({ dateStyle: "long" });

    // Watch the current form values
    const watchDateRange = watch('dateRange');

    // Handle form submission
    const onSubmit = (data: DateRangeFormInputs) => {
        console.log('Submitted Date Range:', data.dateRange);
        alert(`Selected Range: ${formatter.formatRange(
            data.dateRange.start.toDate(getLocalTimeZone()),
            data.dateRange.end.toDate(getLocalTimeZone())
        )}`);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Controller
                name="dateRange"
                control={control}
                rules={{
                    validate: {
                        required: (value) => value !== null || "Date range is required",
                        validRange: (value) =>
                            value.start <= value.end || "Start date must be before or equal to end date"
                    }
                }}
                render={({ field }) => (
                    <div className="flex flex-col">
                        <DateRangePicker
                            label="Select Date Range"
                            value={field.value}
                            onChange={(newValue) => {
                                field.onChange(newValue);
                            }}
                            granularity="minute"
                            errorMessage={errors.dateRange?.message}
                        />
                    </div>
                )}
            />

            {watchDateRange && (
                <p className="text-default-500 text-sm">
                    Selected date:{" "}
                    {formatter.formatRange(
                        watchDateRange.start.toDate(getLocalTimeZone()),
                        watchDateRange.end.toDate(getLocalTimeZone())
                    )}
                </p>
            )}

            <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded"
            >
                Submit Date Range
            </button>
        </form>
    );
};

export default DateRangePickerForm;