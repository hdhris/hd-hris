import { AccessRole, static_privilege } from "@/types/privilege/privilege";
import React, { useCallback, useState } from "react";
import { ValueLabel } from "../attendance-time/overtime/view-overtime";
import { MdOutlineGroups2 } from "react-icons/md";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import Drawer from "@/components/common/Drawer";
import { IoAccessibilityOutline } from "react-icons/io5";
import { Button, Card, Chip, ScrollShadow } from "@nextui-org/react";
import { getColor } from "@/helper/background-color-generator/generator";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import PrivilegesList from "./tree";
import { UserPrivileges } from "@/types/JSON/user-privileges";
import QuickModal from "@/components/common/QuickModal";
import showDialog from "@/lib/utils/confirmDialog";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { mutate } from "swr";

interface ViewPrivilegeProps {
    accessRole: AccessRole | null;
    onClose: () => void;
}

function ViewPrivilege({ accessRole, onClose }: ViewPrivilegeProps) {
    const [manageAccessibility, setManageAccessibility] = useState<UserPrivileges | null>(null);

    const handleAccessibilityUpdate = useCallback(async () => {
        if (!manageAccessibility || !accessRole) return;
        const result = await showDialog({
            title: "Update Accessibility",
            message: (
                <div className="space-y-2">
                    <p>Updating privileges will <span className="text-red-500">log out</span> all users currently associated with the affected privileges</p>
                    <p>Are you sure you want to proceed?</p>
                </div>
            ),
            preferredAnswer: "no",
        });
        if (result != "yes") return;

        const newAccessRole = {
            id: accessRole.id,
            accessibility: manageAccessibility,
        };
        try {
            await axios.post("/api/admin/privilege/update-accessibility", newAccessRole);
            toast({
                title: "Accessibility updated successfully",
                variant: "success",
            });

            setManageAccessibility(null);
            onClose();
            mutate("/api/admin/privilege");
        } catch (error) {
            console.log(error);
            toast({
                title: "An error has occured",
                variant: "danger",
            });
        }
    }, [accessRole, manageAccessibility, onClose, mutate]);

    return (
        <Drawer isOpen={!!accessRole} onClose={onClose} title={accessRole && `${accessRole?.name} Details`}>
            {accessRole && (
                <div className="space-y-4">
                    <ValueLabel
                        vertical
                        icon={<MdOutlineGroups2 />}
                        label="Employees"
                        value={
                            <div className="flex flex-wrap gap-4 p-2">
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
                    <ValueLabel
                        label="Accessibility"
                        icon={<IoAccessibilityOutline />}
                        vertical
                        value={
                            <Card shadow="none" className="border p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-medium text-gray-500">{`${accessRole.accessibility.modules.length}/${static_privilege.modules.length} Privileges`}</p>
                                    <Button
                                        onPress={() => setManageAccessibility(accessRole.accessibility)}
                                        {...uniformStyle()}
                                    >
                                        Manage
                                    </Button>
                                </div>
                                {accessRole.accessibility.modules.map((module, index) => (
                                    <div key={index} className="flex flex-col">
                                        <p className="font-semibold text-medium">{module.name}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {module.privileges.map((priv, index) => (
                                                <Chip
                                                    key={index}
                                                    radius="sm"
                                                    style={{
                                                        background: getColor(priv.name, 0.2),
                                                        borderColor: getColor(priv.name, 0.5),
                                                        color: getColor(priv.name),
                                                    }}
                                                    variant="bordered"
                                                    className="mr-2 mb-2"
                                                >
                                                    {priv.name}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                    // <Chip
                                    //     key={index}
                                    //     radius="sm"
                                    //     style={{
                                    //         background: getColor(module.name, 0.2),
                                    //         borderColor: getColor(module.name, 0.5),
                                    //         color: getColor(module.name),
                                    //     }}
                                    //     variant="bordered"
                                    //     className="mr-2 mb-2"
                                    // >
                                    //     {module.name}
                                    // </Chip>
                                ))}
                            </Card>
                        }
                    />
                </div>
            )}
            <QuickModal
                title={"Privilege Tree"}
                isOpen={!!manageAccessibility}
                onClose={() => setManageAccessibility(null)}
                buttons={{
                    onClose: {
                        label: "Close",
                        onPress: () => setManageAccessibility(null),
                    },
                    onAction: {
                        label: "Update",
                        onPress: handleAccessibilityUpdate,
                    },
                }}
                size="xs"
            >
                <ScrollShadow>
                    <PrivilegesList accessibility={manageAccessibility} setAccessibility={setManageAccessibility} />
                </ScrollShadow>
            </QuickModal>
        </Drawer>
    );
}

export default ViewPrivilege;
