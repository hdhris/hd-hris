import React from 'react';
import {Avatar, AvatarProps, Tooltip, TooltipProps} from "@nextui-org/react";
import {EmployeeDetails} from "@/types/employeee/EmployeeType";

interface UserAvatarTooltipProps{
    user: EmployeeDetails
    tooltipProps?: Omit<TooltipProps, "content">
    avatarProps?: Omit<AvatarProps, "alt" | "src">
}
function UserAvatarTooltip({user, ...rest}: UserAvatarTooltipProps) {
    return (
        <Tooltip key={user.id} content={user.name} {...rest.tooltipProps}>
            <Avatar
                {...rest.avatarProps}
                alt={user.name}
                src={user.picture}
            />
        </Tooltip>

    );
}

export default UserAvatarTooltip;