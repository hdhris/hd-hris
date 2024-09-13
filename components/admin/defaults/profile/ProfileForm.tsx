'use client'
import {Avatar, CircularProgress, cn, DatePicker} from "@nextui-org/react";
import {Form} from "@/components/ui/form";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {z} from "zod";
import {UserRound} from "lucide-react";
import Text from "@/components/Text";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {icon_color} from "@/lib/utils";
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
import AddressInput from "@/components/common/forms/address/AddressInput";
import {useEdgeStore} from "@/lib/edgestore/edgestore";
import {ToastAction} from "@/components/ui/toast";
import {signOut} from "next-auth/react";

export default function ProfileForm() {
    const {edgestore} = useEdgeStore();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [prevImage, setPrevImage] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<File | null>(null)
    const [birthdate, setBirthdate] = useState<DateValue | null>(null);
    const [fileError, setFileError] = useState<string>("");
    const {data: profile, isLoading} = useUser();
    const [uploadingProgress, setUploadingProgress] = useState<{
        progress: number, status: "Complete" | "Uploading" | "Error" | null
    }>({
        progress: 0, status: null
    })
    const form = useForm<z.infer<typeof updateProfileSchema>>({
        resolver: zodResolver(updateProfileSchema),
    });

    useEffect(() => {
        if (profile) {
            console.log(profile)
            form.reset(profile);
            setImage(profile.picture);
            setPrevImage(profile.picture);
            if (profile.birthdate) {
                const date = dayjs(profile.birthdate).format("YYYY-MM-DD");
                setBirthdate(parseDate(date));
                form.setValue("birth_date", date);
            }
        }
    }, [form, profile]);

    const imageRef = useRef<string | null>(null);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrevImage(image);  // Store the current image as previous

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
        setAvatar(file);
        setImage(newImageUrl);
        setFileError("");
        (e.target as HTMLInputElement).value = "";
    }, [image]);


    const handleRemovePhoto = useCallback(() => {
        if (imageRef.current) {
            URL.revokeObjectURL(imageRef.current);
            // console.log("Revoked URL:", imageRef.current); // Debug log
        }
        setImage(null);
        imageRef.current = null;
    }, []);


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
                            <Button size='sm' radius='md' variant='bordered' as='label' htmlFor='dropzone-file'
                                    isDisabled={uploadingProgress.status === 'Uploading'}>
                                <input
                                    aria-label="tag"
                                    id="dropzone-file"
                                    type="file"
                                    name='pic'
                                    disabled={uploadingProgress.status === 'Uploading'}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                Upload new picture
                            </Button>
                            <Button size='sm' radius='sm' isDisabled={uploadingProgress.status === 'Uploading'}
                                    color='danger' onClick={handleRemovePhoto}>
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
                <div className=''>
                    <FormFields items={[{name: "username", label: "Username", isRequired: true}]}/>
                </div>
            </div>);
        },
    }];

    const formNames: FormInputProps[] = [{
        name: "first_name", label: "First Name", isRequired: true
    }, {name: "last_name", label: "Last Name", isRequired: true}];

    const contact_info: FormInputProps[] = [{name: "email", label: "Email", isRequired: true}, {
        name: "contact_no", label: "Phone No.", type: "tel", isRequired: true
    }];

    const gender = [{key: "M", label: "M"}, {key: "F", label: "F"}];

    async function onSubmit(values: z.infer<typeof updateProfileSchema>) {

        let avatarImage = null;
        try {
            if (avatar) {
                // Check if there is a previous image to replace
                if (prevImage) {
                    // Replace existing image
                    const res = await edgestore.publicFiles.upload({
                        file: avatar,
                        options: {
                            replaceTargetUrl: prevImage, // Use replaceTargetUrl for replacement
                        },
                        onProgressChange: async (progress) => {
                            setUploadingProgress({ progress, status: "Uploading" });
                            if (progress === 100) {
                                await new Promise((resolve) => setTimeout(resolve, 1000));
                                setUploadingProgress({ progress: 100, status: "Complete" });
                            }
                        },
                    });

                    avatarImage = res.url;
                    setImage(res.url);
                    console.log("Replacing: ", res);
                } else {
                    // Upload new image (no previous image to replace)
                    const res = await edgestore.publicFiles.upload({
                        file: avatar,
                        onProgressChange: async (progress) => {
                            setUploadingProgress({ progress, status: "Uploading" });
                            if (progress === 100) {
                                await new Promise((resolve) => setTimeout(resolve, 1000));
                                setUploadingProgress({ progress: 100, status: "Complete" });
                            }
                        },
                    });

                    avatarImage = res.url;
                    setImage(res.url);
                    console.log("Uploading: ", res);
                }
            } else{
                if(prevImage){
                    await edgestore.publicFiles.delete({url: prevImage});
                }
            }
        } catch (error) {
            console.log("Error uploading image:", error);
            // Handle errors as needed
        }

        const data = {
            ...values, picture: avatarImage
        }
        setLoading(true);
        try {
            const response = await axiosInstance.put('/api/admin/update-profile', data);
            if (response.status === 200) {
                toast({
                    description: `${response.data.message} and you will be signed out in 1 minute or signed out now.`,
                    action: <ToastAction altText="Sign out" onClick={() => signOut({callbackUrl: '/'})}>Sign
                        out</ToastAction>,
                    variant: 'success'
                })

                if(window.location.href !== '/'){
                    setTimeout(() => {
                        signOut({callbackUrl: '/'})
                    }, 60000)
                }

            }
        } catch (error: any) {
            console.error("Error submitting form:", error);
            toast({
                description: error.response.data.message, variant: 'danger',
            })
        }
        setLoading(false);
    }

    return (<Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 flex flex-col p-2 h-full overflow-hidden'>
            <ScrollShadow className="h-full pr-4" size={10}>
                <FormFields items={upperInput}/>
                <div className='grid grid-cols-2 gap-4'>
                    <FormFields items={formNames}/>
                    <FormFields
                        items={[{
                            name: "birth_date",
                            label: "Birth Date",
                            Component: (field) => (<div className="w-full flex flex-row gap-4">
                                <DatePicker
                                    isRequired={true}
                                    onChange={(e) => {
                                        if (e) {
                                            form.setValue("birth_date", e.toString());
                                        }
                                        field.onChange(e.toString());
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
                                    showMonthAndYearPickers
                                />
                            </div>),
                        },]}
                        size='sm'
                    />
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
                    <AddressInput/>
                </div>
            </ScrollShadow>
            <div className='flex justify-end gap-2'>
                <Button type='submit' isLoading={loading} isDisabled={isLoading} size='sm' radius='md' color='primary'>
                    Save
                </Button>
            </div>
        </form>
    </Form>);
}
