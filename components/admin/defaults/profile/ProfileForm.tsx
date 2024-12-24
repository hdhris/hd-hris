'use client'
import {Avatar, cn} from "@nextui-org/react";
import {Form} from "@/components/ui/form";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {z} from "zod";
import Text from "@/components/Text";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import FormFields, {FormInputProps} from "@/components/common/forms/FormFields";
import {Button} from "@nextui-org/button";
import {useUser} from "@/services/queries";
import {updateProfileSchema} from "@/helper/zodValidation/UpdateProfile";
import {axiosInstance} from "@/services/fetcher";
import {toast} from "@/components/ui/use-toast";
import {useEdgeStore} from "@/lib/edgestore/edgestore";
import {signOut} from "next-auth/react";
import {ToastAction} from "@/components/ui/toast";
import {useCredentials} from "@/hooks/Credentials";
import { LuUserCircle2 } from "react-icons/lu";
import {useIsClient} from "@/hooks/ClientRendering";

export default function ProfileForm() {
    const {edgestore} = useEdgeStore();
    const isCredential = !useCredentials()
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [prevImage, setPrevImage] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<File | null>(null)
    const [fileError, setFileError] = useState<string>("");
    const {data: profile, isLoading} = useUser();
    const isClient = useIsClient()
    const [uploadingProgress, setUploadingProgress] = useState<{
        progress: number, status: "Complete" | "Uploading" | "Error" | null
    }>({
        progress: 0, status: null
    })

    const profileschema = isCredential ? updateProfileSchema.omit({username: true}) : updateProfileSchema
    const form = useForm<z.infer<typeof profileschema>>({
        resolver: zodResolver(profileschema),
        defaultValues: {
            display_name: ""
        }
    });


    useEffect(() => {
        if (profile) {
            form.reset(profile);
            setImage(profile.image);
            setPrevImage(profile.image);
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
        name: "picture", Component: (field) => {
            return (<div className='grid grid-cols-2 relative mb-2'>
                <div className='flex items-center gap-2'>
                    <div className="w-fit">
                        <Avatar
                            showFallback
                            src={image as string}
                            isBordered={!!fileError}
                            color={fileError ? 'danger' : 'default'}
                            className='w-16 h-16'
                            fallback={<LuUserCircle2 className="w-10 h-10 text-default-500" size={20}/>}
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
                                    color='danger' onPress={handleRemovePhoto}>
                                Remove
                            </Button>
                        </div>
                    </div>

                </div>
            </div>);
        },
    }];

    async function onSubmit(values: z.infer<typeof profileschema>) {
        setLoading(true);
        let avatarImage = image;
        // console.log("Is Match: ", prevImage === image);
        try {
           if(prevImage !== image) {
               if (avatar) {
                   // Check if there is a previous image to replace
                   if (prevImage) {
                       // Replace existing image
                       const res = await edgestore.publicFiles.upload({
                           file: avatar, options: {
                               replaceTargetUrl: prevImage, // Use replaceTargetUrl for replacement
                           }, onProgressChange: async (progress) => {
                               setUploadingProgress({progress, status: "Uploading"});
                               if (progress === 100) {
                                   await new Promise((resolve) => setTimeout(resolve, 1000));
                                   setUploadingProgress({progress: 100, status: "Complete"});
                               }
                           },
                       });

                       avatarImage = res.url;
                       setImage(res.url);
                       // console.log("Replacing: ", res);
                   } else {
                       // Upload new image (no previous image to replace)
                       const res = await edgestore.publicFiles.upload({
                           file: avatar, onProgressChange: async (progress) => {
                               setUploadingProgress({progress, status: "Uploading"});
                               if (progress === 100) {
                                   await new Promise((resolve) => setTimeout(resolve, 1000));
                                   setUploadingProgress({progress: 100, status: "Complete"});
                               }
                           },
                       });

                       avatarImage = res.url;
                       setImage(res.url);
                       // console.log("Uploading: ", res);
                   }
               } else {
                   if (prevImage) {
                       await edgestore.publicFiles.delete({url: prevImage});
                   }
               }
           }
        } catch (error) {
            console.log("Error uploading image:", error);
            throw error;
            // Handle errors as needed
        }

        const data = {
            ...values, picture: avatarImage
        }
        try {
            const response = await axiosInstance.put('/api/admin/update-profile', data);
            if (response.status === 200) {
                toast({
                    description: `${response.data.message} and you will be signed out in 1 minute for the changes to take effect, or you can sign out immediately`,
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

    if(!isClient) return null
    return (<Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5 flex flex-col p-2 h-full overflow-hidden'>
            <FormFields items={upperInput}/>
            <div className="grid grid-cols-2 gap-4">
                <FormFields items={[{name: "display_name", label: "Display Name"},
                    {name: "username", label: "Username", inputDisabled: isCredential, inputClassName: isCredential ? 'opacity-50 pointer-events-none cursor-not-allowed': ""}]}
                />
            </div>
            <div className='flex justify-end gap-2'>
                <Button type='submit' isLoading={loading} isDisabled={isLoading || uploadingProgress.status === 'Uploading'} size='sm' radius='sm' color='primary'>
                    Save
                </Button>
            </div>
        </form>
    </Form>);
}
