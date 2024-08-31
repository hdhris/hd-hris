'use client';
import React, { useCallback, useEffect, useState } from 'react';
import SelectionMenu from "@/components/dropdown/SelectionMenu";
import { cn, SharedSelection, Spinner } from "@nextui-org/react";
import { axiosInstance } from "@/services/fetcher";
import { LuCheck, LuX } from "react-icons/lu";
import { icon_size } from "@/lib/utils";

const strategy = [
    { uid: 'none', name: 'None' },
    { uid: 'full', name: 'Full' },
    { uid: 'differential', name: 'Differential' },
    { uid: 'incremental', name: 'Incremental' },
];

function BackupStrategy() {
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState<boolean | undefined>(undefined);
    const [showIcon, setShowIcon] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;

        if (isSuccess !== undefined) {
            setShowIcon(true);
            timer = setTimeout(() => {
                setShowIcon(false);
            }, 3000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isSuccess]);

    const handleSelectionChange = useCallback(async (key: SharedSelection) => {
        setIsSuccess(undefined);
        setLoading(true);
        try {
            const res = await axiosInstance.put('/api/admin/backup/strategy', { strategy: key.anchorKey });
            if (res.status === 200) {
                setIsSuccess(true);
            }
        } catch (err: any) {
            console.log('Error while uploading strategy policies.', err);
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <div className='flex gap-2 items-center'>
            <SelectionMenu
                isDisabled={loading}
                onSelectionChange={handleSelectionChange}
                defaultSelectedKeys={['none']}
                options={strategy}
                isRequired={false}
            />
            <span className='relative w-6'>
                {loading && <Spinner size='sm' />}
                {showIcon && !loading && (
                    isSuccess ? (
                        <LuCheck className={cn('text-success', icon_size)} />
                    ) : (
                        <LuX className={cn('text-danger', icon_size)} />
                    )
                )}
            </span>
        </div>
    );
}

export default BackupStrategy;
