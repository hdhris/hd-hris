'use client'
import {Avatar, Badge, DatePicker} from "@nextui-org/react";
import {Form} from "@/components/ui/form";
import React, {useState} from "react";
import {z} from "zod";
import {Plus, UserRound} from "lucide-react";
import Text from "@/components/Text";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {cn, icon_color} from "@/lib/utils";
import FormFields, {FormInputProps, Selection} from "@/components/forms/FormFields";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {Button} from "@nextui-org/button";
import {Divider} from "@nextui-org/divider";

const yearLimit = new Date()
yearLimit.setFullYear(new Date().getFullYear() - 21)
const formSchema = z.object({
    rfid: z.coerce.number().min(2, {message: "RFID must be at least 2 characters."}),
    first_name: z.string().min(2, {
        message: "First Name must be at least 2 characters.",
    }),
    last_name: z.string().min(2, {
        message: "Last Name must be at least 2 characters.",
    }),
    gender: z.enum(["male", "female", "others"]),
    birth_date: z.coerce.date().max(yearLimit, {message: "Must be at least 21 years old."}),
    age: z.coerce.number().min(21, {message: "Must be at least 21 years old."}),
    civil_status: z.enum(["single", "married", "widowed", "separated", "divorced", "others"]),
    email: z.string().email("Invalid email address."),
    phone_no: z.string().length(10).transform((value) => parseInt(value)),
    street_or_purok: z.string().min(5, {
        message: "Street or Purok must be at least 5 characters.",
    }),
    barangay: z.string().min(5, {
        message: "Barangay must be at least 5 characters.",
    }),
    city: z.string().min(5, {
        message: "City must be at least 5 characters.",
    }),
    province: z.string().min(5, {
        message: "Province must be at least 5 characters.",
    })
})

export default function ProfileForm() {
    const [image, setImage] = useState<string>("")
    const [fileError, setFileError] = useState<string>("")
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const upperInput: FormInputProps[] = [{
        name: "picture", Component: () => {
            return (<div className='flex justify-between items-center relative'>
                <div className='flex items-center gap-2'>
                    <div className="w-fit">
                        <Avatar showFallback src={image} isBordered={!!fileError}
                                color={fileError ? 'danger' : 'default'}
                                className='w-16 h-16'
                                fallback={<UserRound className="w-10 h-10 text-default-500" size={20}/>}/>

                    </div>
                    <div className='ml-3 flex flex-col gap-2'>
                        <Text
                            className={cn('italic text-center text-xs w-32 text-wrap', fileError && 'text-red-500')}>Pick
                            a profile picture
                            under
                            5mb</Text>
                        {fileError && <Text className='text-red-500 font-semibold text-xs'>{fileError}</Text>}
                    </div>
                </div>
                <div className='space-x-2'>
                    <Button size='sm' radius='md' variant='bordered' as='label' htmlFor='dropzone-file'>
                        <input id="dropzone-file"
                               type="file"
                               name='pic'
                               className="hidden"
                               accept="image/*"
                               onChange={(e) => {
                                   const files = e.target.files;
                                   if (!files || files.length === 0) {
                                       setFileError("No file selected")
                                       return;
                                   }

                                   const file = files[0];

                                   // Validate file size up to 5MB
                                   if (file.size > 1024 * 1024 * 5) {
                                       setFileError("File size must be less than 5MB")
                                       return
                                   }

                                   // File is valid, continue with your logic
                                   setImage(file && URL.createObjectURL(file))
                               }}/>
                        Upload new picture
                    </Button>
                    <Button size='sm' radius='md' color='danger'>Delete</Button>
                </div>
            </div>)
        }
    },]

    const formNames: FormInputProps[] = [{
        name: "first_name", label: "First Name", isRequired: true
    }, {
        name: "middle_name", label: "Middle Name"
    }, {
        name: "last_name", label: "Last Name", isRequired: true
    },]

    const contact_info: FormInputProps[] = [{
        name: "email", label: "Email", type: "email", isRequired: true
    }, {
        name: "phone_no", label: "Phone No.", type: "tel", isRequired: true
    }]
    const street = ["Street", "Purok"]

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Submitted values:", values);
    }

    return (<ScrollShadow className="h-full" size={10}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 flex flex-col p-2'>
                    <FormFields items={upperInput}/>
                    <div className='grid grid-cols-2 gap-4'>
                        <FormFields items={formNames}/>
                        <FormFields items={[{
                            name: "birth_date", label: "Birth Date", isRequired: true, Component: (field) => {
                                return (<div className="w-full max-w-xl flex flex-row gap-4">
                                    <DatePicker
                                        onChange={field.onChange}
                                        aria-label="Birth Date"
                                        variant="bordered"
                                        radius="sm"
                                        classNames={{
                                            selectorIcon: icon_color,
                                        }}
                                        color="primary"
                                        showMonthAndYearPickers
                                    />
                                </div>)
                            }
                        }]}/>
                        <div className='col-span-2 space-y-2'>
                            <Divider/>
                            <div className='relative flex justify-between items-center'>
                                <Text>Contact Information</Text>
                                <Badge content={<Plus/>} shape='circle' classNames={{
                                    badge: 'size-6', base: 'absolute right-2 cursor-pointer',
                                }} onClick={() => alert('hi')}>{''}</Badge>
                            </div>
                        </div>
                        <FormFields items={contact_info}/>
                        <div className='col-span-2 space-y-2'>
                            <Divider/>
                            <Text>Address Information</Text>
                        </div>
                        <Selection items={street}
                                   placeholder=""
                                   label='Street/Purok'
                                   name='street_or_purok'
                                   isRequired
                                   aria-label="Street or Purok" // Added aria-label
                        />
                        <Selection items={street}
                                   placeholder=""
                                   label='Barangay'
                                   name='barangay'
                                   isRequired
                                   aria-label="Barangay" // Added aria-label
                        />
                        <Selection items={street}
                                   placeholder=""
                                   label='City'
                                   name='city'
                                   isRequired
                                   aria-label="City" // Added aria-label
                        />
                        <Selection items={street}
                                   placeholder=""
                                   label='Province'
                                   name='province'
                                   isRequired
                                   aria-label="Province" // Added aria-label
                        />
                    </div>
                    <div className='flex justify-end gap-2'>
                        <Button type='submit' size='sm' radius='md'>Cancel</Button>
                        <Button type='submit' size='sm' radius='md' color='primary'>Apply</Button>
                    </div>
                </form>
            </Form>
        </ScrollShadow>)
}