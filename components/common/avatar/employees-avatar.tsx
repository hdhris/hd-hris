import React, {Key} from 'react';
import {Avatar, AvatarGroup, AvatarGroupProps, Tooltip} from '@nextui-org/react';
import {EmployeeDetails} from "@/types/employeee/EmployeeType";
import Typography from "@/components/common/typography/Typography";

interface EmployeesAvatarProps extends AvatarGroupProps{
    employees: EmployeeDetails[]
    handleEmployeePicture?: (id: Key) => void;
}

const EmployeesAvatar: React.FC<EmployeesAvatarProps> = ({employees: items, handleEmployeePicture, ...props}) => {
    if (!items || items.length === 0) {
        return <Typography className="font-semibold text-sm !text-default-400/50">No Employees</Typography>; // Handle the case where item is not provided
    }

    return (<AvatarGroup isBordered color="primary" max={3} className="w-full h-full" renderCount={(count) => {
        return (<div onClick={() => alert("more")}
                     className="flex relative justify-center items-center box-border overflow-hidden align-middle z-0 outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 w-10 h-10 text-tiny bg-primary text-primary-foreground rounded-full ring-2 ring-offset-2 ring-offset-background dark:ring-offset-background-dark -ms-2 data-[hover=true]:-translate-x-3 rtl:data-[hover=true]:translate-x-3 transition-transform data-[focus-visible=true]:-translate-x-3 rtl:data-[focus-visible=true]:translate-x-3 ring-primary !size-6 outline">+{count}</div>)
    }} {...props}>
        {items.map(item => (<Tooltip key={item.id} content={item.name}>
            <Avatar
                onClick={() => handleEmployeePicture && handleEmployeePicture(item.id)}
                classNames={{
                    base: '!size-6',
                }}
                alt={item.name}
                src={item.picture}
            />
        </Tooltip>))}
    </AvatarGroup>);
};

export default EmployeesAvatar;
