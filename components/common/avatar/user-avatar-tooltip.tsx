import React from 'react';
import {Avatar, Tooltip} from "@nextui-org/react";
import {EmployeeDetails} from "@/types/employeee/EmployeeType";

interface UserAvatarTooltipProps{
    user: EmployeeDetails
}
function UserAvatarTooltip({user}: UserAvatarTooltipProps) {
    return (
        <Tooltip key={user.id} content={user.name}>
            <Avatar
                classNames={{
                    base: '!size-6',
                }}
                alt={user.name}
                src={user.picture}
            />
        </Tooltip>

    );
}

export default UserAvatarTooltip;