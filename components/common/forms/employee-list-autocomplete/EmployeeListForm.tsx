"use client";
import React from 'react';
import {Autocomplete, AutocompleteItem, User} from "@nextui-org/react";
import Typography from "@/components/common/typography/Typography";
import {Controller, useFormContext} from "react-hook-form";
import {useEmployeeList} from "@/hooks/useEmployeeList";
import {useInfiniteScroll} from "@nextui-org/use-infinite-scroll";

function EmployeeListForm() {
    const {control} = useFormContext();
    const [isOpen, setIsOpen] = React.useState(false);
    const { hasMore, onLoadMore, isLoading, items } = useEmployeeList({fetchDelay: 500});
    const [, scrollerRef] = useInfiniteScroll({
        hasMore,
        isEnabled: isOpen,
        shouldUseLoader: false, // Disable loader display at the bottom
        onLoadMore,
    });
    return (
        <Controller
            control={control}
            name="employee_name"
            render={({ field }) => (
                <Autocomplete
                    label={
                        <Typography className="text-sm font-medium inline-flex">Pick an Employee</Typography>
                    }
                    isRequired
                    radius="sm"
                    placeholder="Select an Employee"
                    defaultItems={items}
                    labelPlacement="outside"
                    className="max-w-xs"
                    variant="bordered"
                    isLoading={isLoading}
                    scrollRef={scrollerRef}
                    onOpenChange={setIsOpen}

                    {...field}
                >
                    {(item) => (
                        <AutocompleteItem textValue={item.name} key={item.id} className="capitalize"> {/* Use item.id here */}
                            <User
                                name={item.name}
                                description={item.department}
                                avatarProps={{
                                    src: item.picture
                                }}
                            />
                        </AutocompleteItem>
                    )}
                </Autocomplete>
            )}
        />
    );
}

export default EmployeeListForm;