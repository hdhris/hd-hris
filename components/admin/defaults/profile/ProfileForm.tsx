'use client'
import {Avatar, DatePicker, SharedSelection} from "@nextui-org/react";
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
import {Address} from "@/types/routes/default/types";


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
    const [regions, setRegions] = useState<{key: number, label: string}[]>([])
    const [selectedRegion, setSelectedRegion] = useState<string>("")
    const [provinces, setProvinces] = useState<{key: number, label: string}[]>([])
    const [municipals, setMunicipals] = useState<{key: number, label: string}[]>([])
    const [barangays, setBarangays] = useState<{key: number, label: string}[]>([])
    const [fileError, setFileError] = useState<string>("");
    const {data: profile, isLoading} = useUser();
    const form = useForm<z.infer<typeof updateProfileSchema>>({
        resolver: zodResolver(updateProfileSchema),
    });

    const handleSelectedRegion = useCallback((key: SharedSelection) => {
        setSelectedRegion(key.currentKey!)
    }, [])

    useEffect(() => {
        if (profile) {
            setRegions(profile.addresses.filter((id) => id.parent_code === 0).map((region) => ({key: region.address_code, label: region.address_name})));
            setProvinces(profile.addresses.map((prov) => ({key: prov.address_code, label: prov.address_name})));
            setMunicipals(profile.addresses.map((mun) => ({key: mun.address_code, label: mun.address_name})));
            setBarangays(profile.addresses.map((bar) => ({key: bar.address_code, label: bar.address_name})));
            // setSelectedRegion(String(profile.users.addr_region))
            // address.filter((id) => id.address_code === 0).map((region) => region.address_name);
            setSelectedRegion(String(profile.users.addr_region))
            form.reset(profile.users)
            setImage(profile.users.picture);
            if (profile.users.birthdate) {
                const date = dayjs(profile.users.birthdate).format("YYYY-MM-DD");
                setBirthdate(parseDate(date))
                form.setValue("birth_date", date)
            }
        }
    }, [form, profile, regions]);



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

    // const regions = address.filter((id) => id.address_code === 0).map((region) => region.address_name);

    const upperInput: FormInputProps[] = [{
        name: "picture", Component: () => {
            return (<div className='grid grid-cols-2 relative mb-2'>
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
                    <FormFields items={[{name: "username", label: "Username", isRequired: true}]}/>
                </div>
            </div>);
        }
    }];

    const formNames: FormInputProps[] = [{
        name: "first_name", label: "First Name", isRequired: true
    }, {
        name: "last_name", label: "Last Name", isRequired: true
    }];

    const contact_info: FormInputProps[] = [{
        name: "email", label: "Email", isRequired: true
    }, {
        name: "contact_no", label: "Phone No.", type: "tel", isRequired: true
    }];

    const gender = [{key: "M", label: "M"}, {key: "F", label: "F"}];
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

    const region = [{
        key: "region",
        label: "Region",
    }, {
        key: "province",
        label: "Province",
    }];
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
                                    isRequired={true}
                                    onChange={(e) => {
                                        if(e){
                                            form.setValue("birth_date", dayjs(e.toString()).format("YYYY-MM-DD"));
                                        }
                                        field.onChange(e);
                                        setBirthdate(e);
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
                        items={gender}
                        isRequired={true}
                        placeholder=""
                        label='Gender'
                        name='gender'
                        aria-label="Gender"
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
                        // isRequired={true}
                        items={regions}
                        selectedKeys={[selectedRegion]}
                        placeholder=""
                        label='Region'
                        name='addr_region'
                        aria-label="Region"
                        onSelectionChange={handleSelectedRegion}
                    />
                    <Selection
                        // isRequired={true}
                        items={provinces}
                        placeholder=""
                        label='Province'
                        name='addr_province'
                        aria-label="Province"

                    />
                    {/*<Selection*/}
                    {/*    // isRequired={true}*/}
                    {/*    items={municipals}*/}
                    {/*    placeholder=""*/}
                    {/*    label='Municipality'*/}
                    {/*    name='addr_municipal'*/}
                    {/*    aria-label="Municipality"*/}
                    {/*/>*/}
                    {/*<Selection*/}
                    {/*    // isRequired={true}*/}
                    {/*    items={barangays}*/}
                    {/*    placeholder=""*/}
                    {/*    label='Barangay'*/}
                    {/*    name='addr_barangay'*/}
                    {/*    aria-label="Barangay"*/}
                    {/*/>*/}


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
