import React, {ReactNode} from 'react';
import {LeaveType} from "@/types/leaves/LeaveTypes";
import {Title} from "@/components/common/typography/Typography";
import Drawer, {DrawerProps} from "@/components/common/Drawer";

interface FormDrawer extends Omit<DrawerProps, "onClose">{
    title: ReactNode
    description: ReactNode
    onOpen: (value: boolean) => void
    isOpen: boolean,
    children: React.ReactNode
    isLoading: boolean
}

function FormDrawer({...props}: FormDrawer) {
    return (
        <Drawer {...props} isSubmitting={props.isLoading} isOpen={props.isOpen} onClose={props.onOpen} title={
            <Title
            className="ms-1"
            heading={props.title}
            subHeading={props.description}
            classNames={{
                heading: "text-lg", subHeading: "font-normal"
            }}
        />}>
            {props.children}
        </Drawer>
    );
}

export default FormDrawer;