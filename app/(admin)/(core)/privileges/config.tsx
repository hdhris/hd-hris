import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import Typography from "@/components/common/typography/Typography";
import { getColor } from "@/helper/background-color-generator/generator";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { AccessRole } from "@/types/privilege/privilege";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Chip, Tooltip, Avatar, AvatarGroup } from "@nextui-org/react";

export const privileConfigTable: TableConfigProps<AccessRole> = {
    columns: [
        { uid: "name", name: "Name", sortable: true },
        { uid: "employees", name: "Employees", sortable: false },
        { uid: "accessibility", name: "Accessibility", sortable: false },
    ],
    rowCell: (item, columnKey) => {
        switch (columnKey) {
            case "name":
                return <Typography>{item.name}</Typography>;
            case "employees":
                return (
                    <AvatarGroup>
                        {item.acl_user_access_control.map(
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
                                            isBordered: true
                                        }}
                                    />
                                )
                        )}
                    </AvatarGroup>
                );
            case "accessibility":
                return (
                    <div>
                        {item.accessibility.modules.map((module, index) => (
                            <Chip
                                key={index}
                                radius="sm"
                                style={{
                                    background: getColor(module.name, 0.2),
                                    borderColor: getColor(module.name, 0.5),
                                    color: getColor(module.name),
                                }}
                                variant="bordered"
                                className="mr-2 mb-2"
                            >
                                {module.name}
                            </Chip>
                        ))}
                    </div>
                );
            default:
                return <></>;
        }
    },
};
