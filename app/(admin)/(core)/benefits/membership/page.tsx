"use client"
import React, {useCallback, useState} from 'react';
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import {Button} from "@nextui-org/button";
import {uniformStyle} from "@/lib/custom/styles/SizeRadius";
import LeaveCreditForm from "@/components/admin/leaves/credits/leave-credit-form";

function Page() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const onOpenDrawer = useCallback(() => {
        setIsOpen(true)
    }, [setIsOpen])
    SetNavEndContent(() => {

        return (<>
            <Button {...uniformStyle()} onClick={onOpenDrawer}>
                Add Leave Credit
            </Button>
            <LeaveCreditForm onOpen={setIsOpen} isOpen={isOpen}/>
        </>)
    })
    return (
        <div>Membership</div>
    );
}

export default Page;