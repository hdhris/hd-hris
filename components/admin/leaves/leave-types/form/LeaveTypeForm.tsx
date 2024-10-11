import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {Autocomplete, AutocompleteItem, cn} from "@nextui-org/react";
import React from "react";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import {Button} from "@nextui-org/button";
import {Form} from "@/components/ui/form";
import Typography from "@/components/common/typography/Typography";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const LeaveTypeSchema = z.object({
    leave_type_name: z.string().min(1, {message: "Name is required"}),
})
const LeaveTypeForm = () => {
    const animals = [
        {label: "Cat", value: "cat", description: "The second most popular pet in the world"},
        {label: "Dog", value: "dog", description: "The most popular pet in the world"},
        {label: "Elephant", value: "elephant", description: "The largest land animal"},
        {label: "Lion", value: "lion", description: "The king of the jungle"},
        {label: "Tiger", value: "tiger", description: "The largest cat species"},
        {label: "Giraffe", value: "giraffe", description: "The tallest land animal"},
        {
            label: "Dolphin",
            value: "dolphin",
            description: "A widely distributed and diverse group of aquatic mammals",
        },
        {label: "Penguin", value: "penguin", description: "A group of aquatic flightless birds"},
        {label: "Zebra", value: "zebra", description: "A several species of African equids"},
        {
            label: "Shark",
            value: "shark",
            description: "A group of elasmobranch fish characterized by a cartilaginous skeleton",
        },
        {
            label: "Whale",
            value: "whale",
            description: "Diverse group of fully aquatic placental marine mammals",
        },
        {label: "Otter", value: "otter", description: "A carnivorous mammal in the subfamily Lutrinae"},
        {label: "Crocodile", value: "crocodile", description: "A large semiaquatic reptile"},
    ];
    const form = useForm<z.infer<typeof LeaveTypeSchema>>({
        resolver: zodResolver(LeaveTypeSchema), defaultValues: {
            leave_type_name: "",
        }
    })

    const leave_type_fields: FormInputProps[] = [{
        name: 'leave_type_name',
        type: "auto-complete",
        label: 'Name',
        placeholder: "e.g., Vacation, Sick Leave",
        description: "The name of the leave type.",
        isRequired: true,
        config: {
            allowsCustomValue: true, options: [{
                value: "sick_leave", label: "Sick Leave"
            }]
        }
    }, {
        name: 'code', type: "text", label: 'Code', isRequired: true,
    }, {
        name: 'description', type: "text-area", label: 'Description', description: "Provide additional details about this leave type.", isRequired: true, config: {
            placeholder: "Brief description of the leave type"
        }
    }, {
        name: 'accrualRate', type: "number", label: 'Accrual Rate', description: "Rate at which leave is accrued.", isRequired: true
    }, {
        name: "list", type: "select", label: "List", config: {
            options: [{
                label: "Option 1", value: "option1",
            }, {
                label: "Option 2", value: "option2",
            }, {
                label: "Option 3", value: "option3",
            }]
        }
    }, switchToggle({
        name: 'is_active', label: 'Active', description: "Defines if the leave type is marked as active or inactive."
    }), switchToggle({
        name: 'is_carry_forward',
        label: 'Carry Forward',
        description: "Specifies whether unused leave days can be transferred to the next period."
    }), switchToggle({
        name: 'is_paid',
        label: 'Is Paid',
        description: "Determines if the leave type offers payment during the time off."
    }),]
    const onSubmit = (data: z.infer<typeof LeaveTypeSchema>) => {
        console.log(data)
    }
    return (<Sheet>
        <SheetTrigger asChild>
            <Button {...uniformStyle({color: "primary"})}>
                Add Leave Type
            </Button>
        </SheetTrigger>
        <SheetContent className="w-[700px] sm:w-[540px]" autoFocus>
            <SheetHeader>
                <SheetTitle>Add Leave Type</SheetTitle>
                <SheetDescription>
                    <Typography as="span">
                        Please provide the necessary information to create a new leave type.
                    </Typography>
                </SheetDescription>
            </SheetHeader>
            {/*<Form {...form}>*/}
            {/*    */}
            {/*    /!*<form onSubmit={form.handleSubmit(onSubmit)}>*!/*/}
            {/*    /!*    <div className="space-y-4">*!/*/}
            {/*    /!*        <FormFields items={leave_type_fields}/>*!/*/}
            {/*    /!*    </div>*!/*/}
            {/*    */}
            {/*    /!*</form>*!/*/}
            {/*</Form>*/}
            <Select>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                </SelectContent>
            </Select>
            <Autocomplete
                label="Select an animal"
                className="max-w-xs"
                onFocus={(e) => {
                    e.stopPropagation(); // Ensure the Autocomplete gets focus properly
                }}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent Sheet from overriding click events
                }}
            >
                {animals.map((animal) => (
                    <AutocompleteItem key={animal.value} value={animal.value}>
                        {animal.label}
                    </AutocompleteItem>
                ))}
            </Autocomplete>
        </SheetContent>
    </Sheet>)
}


interface SwitchToggle {
    name: string
    description?: string
    label: string
}

const switchToggle = ({name, description, label}: SwitchToggle) => {
    return {
        name: name, type: "switch", label: (<div className="flex flex-col gap-1">
            <p className="text-medium">{label}</p>
            {description ? <p className="text-tiny text-default-400">
                {description}
            </p> : ""}
        </div>), config: {
            classNames: {
                base: cn("inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center", "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent", "data-[selected=true]:border-primary", "rounded"),
                wrapper: "p-0 h-4 overflow-visible",
                thumb: cn("w-6 h-6 border-2 shadow-lg", "group-data-[hover=true]:border-primary", //selected
                    "group-data-[selected=true]:ml-6", // pressed
                    "group-data-[pressed=true]:w-7", "group-data-[selected]:group-data-[pressed]:ml-4",),
            }
        }
    } as FormInputProps
}

export default LeaveTypeForm