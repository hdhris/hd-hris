import { AccessRole } from "@/types/privilege/privilege";
import { Drawer } from "@nextui-org/react";
import React from "react";
import { ValueLabel } from "../attendance-time/overtime/view-overtime";
import { MdOutlineGroups2 } from "react-icons/md";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import { getEmpFullName } from "@/lib/utils/nameFormatter";

interface ViewPrivilegeProps {
    accessRole: AccessRole | null;
    onClose: () => void;
}

function ViewPrivilege({ accessRole, onClose }: ViewPrivilegeProps) {
    return (
        <Drawer isOpen={!!accessRole} onClose={onClose}>
            <div>
                <ValueLabel
                    vertical
                    icon={<MdOutlineGroups2 />}
                    label={"Employees"}
                    value={
                        <div>
                            {accessRole?.acl_user_access_control.map(
                                (user) =>
                                    user.trans_employees && (
                                        <UserAvatarTooltip
                                            user={{
                                                id: user.trans_employees.id,
                                                name: getEmpFullName(user.trans_employees),
                                                picture: user.trans_employees.picture,
                                            }}
                                            key={user.trans_employees.id}
                                            avatarProps={{
                                                isBordered: true,
                                            }}
                                        />
                                    )
                            )}
                        </div>
                    }
                />
            </div>
        </Drawer>
    );
}

export default ViewPrivilege;
