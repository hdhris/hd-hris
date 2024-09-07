'use client'
import {Avatar, DatePicker} from "@nextui-org/react";
import {Form} from "@/components/ui/form";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {z} from "zod";
import {UserRound} from "lucide-react";
import Text from "@/components/Text";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {icon_color} from "@/lib/utils";
import {cn} from '@nextui-org/react'
import FormFields, {FormInputProps, Selection} from "@/components/common/forms/FormFields";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {Button} from "@nextui-org/button";
import {Divider} from "@nextui-org/divider";
import {useUser} from "@/services/queries";
import {DateValue, parseDate} from "@internationalized/date";
import dayjs from "dayjs";
import {updateProfileSchema} from "@/helper/zodValidation/UpdateProfile";
import {axiosInstance} from "@/services/fetcher";
import {toast} from "@/components/ui/use-toast";


type FormData = {
    civil_status: string
    city: string
    barangay: string
    province: string
    street_or_purok: string
}

export default function ProfileForm() {
    const [loading, setLoading] = useState(false)
    const [image, setImage] = useState<string | ArrayBuffer | null>(null);
    const [birthdate, setBirthdate] = useState<DateValue>()
    const [fileError, setFileError] = useState<string>("");
    const {data: profile, isLoading} = useUser();
    const form = useForm<z.infer<typeof updateProfileSchema>>({
        resolver: zodResolver(updateProfileSchema),
    });

    useEffect(() => {
        if (profile) {
            form.reset(profile)
            setImage(profile.profilePicture);
            if (profile.birthdate) {
                const date = dayjs(profile.birthdate).format("YYYY-MM-DD");
                console.log(parseDate(date))
                setBirthdate(parseDate(date))
                form.setValue("birth_date", date)
            }
        }

    }, [form, profile]);

    const imageRef = useRef<string | null>(null);

    const handleRemovePhoto = useCallback(() => {
        if (imageRef.current) {
            URL.revokeObjectURL(imageRef.current);
            // console.log("Revoked URL:", imageRef.current); // Debug log
        }
        setImage(null);
        imageRef.current = null;
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let i = 0;

        const files = e.target.files;
        if (!files || files.length === 0) {
            setFileError("No file selected");
            return;
        }

        const file = files[0];

        // Validate file size up to 5MB
        if (file.size > 1024 * 1024 * 5) {
            setFileError("File size must be less than 5MB");
            return;
        }

        // Create object URL for the new file
        const newImageUrl = URL.createObjectURL(file);
        // console.log("New Image URL:", newImageUrl); // Debug log
        if (imageRef.current) {
            URL.revokeObjectURL(imageRef.current);
            // console.log("Revoked old URL:", imageRef.current); // Debug log
        }
        imageRef.current = newImageUrl;
        setImage(newImageUrl);
        setFileError("");

        // Reset input value to ensure the file change event triggers again if the same file is selected
        (e.target as HTMLInputElement).value = "";
    };

    const upperInput: FormInputProps[] = [{
        name: "picture", Component: () => {
            return (<div className='grid grid-cols-2 relative'>
                <div className='flex items-center gap-2'>
                    <div className="w-fit">
                        <Avatar
                            showFallback
                            src={image as string}
                            isBordered={!!fileError}
                            color={fileError ? 'danger' : 'default'}
                            className='w-16 h-16'
                            fallback={<UserRound className="w-10 h-10 text-default-500" size={20}/>}
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Text className='text-sm'>Upload your photo</Text>
                        <Text className={cn('italic text-xs', fileError && 'text-red-500')}>
                            Pick a profile picture under 5mb
                        </Text>
                        {fileError && <Text className='text-red-500 font-semibold text-xs'>{fileError}</Text>}
                        <div className='space-x-2'>
                            <Button size='sm' radius='md' variant='bordered' as='label' htmlFor='dropzone-file'>
                                <input
                                    aria-label="tag"
                                    id="dropzone-file"
                                    type="file"
                                    name='pic'
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                Upload new picture
                            </Button>
                            <Button size='sm' radius='sm' color='danger' onClick={handleRemovePhoto}>
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
                <div className=''>
                    <FormFields items={[{name: "username", label: "Username"}]}/>
                </div>
            </div>);
        }
    }];

    const formNames: FormInputProps[] = [{
        name: "first_name", label: "First Name"
    }, {
        name: "last_name", label: "Last Name"
    }];

    const contact_info: FormInputProps[] = [{
        name: "email", label: "Email"
    }, {
        name: "phone_no", label: "Phone No.", type: "tel"
    }];

    const civilStatus = ["Single", "Married", "Widowed", "Separated", "Divorced", "Others"];
    const street = ["Street", "Purok"];

    async function onSubmit(values: z.infer<typeof updateProfileSchema>) {
        setLoading(true)
        try {
            const response = await axiosInstance.put('/api/admin/update-profile', values);
            if (response.status === 200) {
                toast({
                    description: response.data.message, variant: 'success',
                })
            }


        } catch (error) {
            console.error("Error submitting form:", error);
        }
        setLoading(false)
    }

    return (<Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-5 flex flex-col p-2 h-full overflow-hidden'>
            <ScrollShadow className="h-full pr-4" size={10}>
                <FormFields items={upperInput}/>
                <div className='grid grid-cols-2 gap-4'>
                    <FormFields items={formNames}/>
                    <FormFields items={[{
                        name: "birth_date", label: "Birth Date", Component: (field) => {
                            return (<div className="w-full flex flex-row gap-4">
                                <DatePicker
                                    onChange={(e) => {
                                        field.onChange(e);
                                        setBirthdate(e);
                                        form.setValue("birth_date", dayjs(e.toString()).format("YYYY-MM-DD"));
                                    }}
                                    name='birth_date'
                                    aria-label="Birth Date"
                                    variant="bordered"
                                    radius="sm"
                                    classNames={{
                                        selectorIcon: icon_color,
                                    }}
                                    color="primary"
                                    value={birthdate}
                                    // value={parseDate(dayjs(birthdate).format("YYYY-MM-DD")) as DateValue}
                                    showMonthAndYearPickers
                                />
                            </div>);
                        }
                    }]} size='sm'/>
                    <Selection
                        items={civilStatus}
                        placeholder=""
                        label='Civil Status'
                        name='civil_status'
                        aria-label="Civil Status"
                    />
                    <div className='col-span-2 space-y-2'>
                        <Divider/>
                        <Text className='text-medium font-semibold'>Contact Information</Text>
                    </div>
                    <FormFields items={contact_info} size='sm'/>
                    <div className='col-span-2 space-y-2'>
                        <Divider/>
                        <Text className='text-medium font-semibold'>Address Information</Text>
                    </div>
                    <Selection
                        items={street}
                        placeholder=""
                        label='Street/Purok'
                        name='street_or_purok'
                        aria-label="Street or Purok"
                    />
                    <Selection
                        items={street}
                        placeholder=""
                        label='Barangay'
                        name='barangay'
                        aria-label="Barangay"
                    />
                    <Selection
                        items={street}
                        placeholder=""
                        label='City'
                        name='city'
                        aria-label="City"
                    />
                    <Selection
                        items={street}
                        placeholder=""
                        label='Province'
                        name='province'
                        aria-label="Province"
                    />
                </div>
            </ScrollShadow>
            <div className='flex justify-end gap-2'>
                <Button type='submit'
                        isLoading={loading}
                        size='sm'
                        radius='md'
                        color='primary'>
                    Save
                </Button>
            </div>
        </form>
    </Form>);
}
