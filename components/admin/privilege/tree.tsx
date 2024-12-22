import React, { useEffect } from "react";
import { Card, Checkbox, Divider, Spinner } from "@nextui-org/react";
import { static_privilege } from "@/types/privilege/privilege";
import { UserPrivileges } from "@/types/JSON/user-privileges";

interface PrivilegesListProps {
    accessibility: UserPrivileges | null;
    setAccessibility: (value: UserPrivileges) => void;
}

function PrivilegesList({ accessibility, setAccessibility }: PrivilegesListProps) {
    // Synchronize changes to accessibility directly
    const updateAccessibility = (updatedFields: Partial<UserPrivileges>) => {
        if (!accessibility) return;

        const updatedAccessibility: UserPrivileges = {
            ...accessibility,
            ...updatedFields,
            modules: static_privilege.modules
                .filter((module) =>
                    updatedFields.modules
                        ? updatedFields.modules.some((m) => m.name === module.name)
                        : accessibility.modules.some((m) => m.name === module.name)
                )
                .map((module) => ({
                    ...module,
                    privileges: module.privileges.filter((privilege) =>
                        updatedFields.modules
                            ? updatedFields.modules.find((m) => m.name === module.name)?.privileges.some(
                                  (p) => p.name === privilege.name
                              )
                            : accessibility.modules
                                  .find((m) => m.name === module.name)
                                  ?.privileges.some((p) => p.name === privilege.name)
                    ),
                })),
        };

        setAccessibility(updatedAccessibility);
    };

    const handlePrivilegeChange = (moduleName: string, privilegeName: string, isChecked: boolean) => {
        if (!accessibility) return;

        const updatedModules = accessibility.modules.map((module) => {
            if (module.name !== moduleName) return module;

            const updatedPrivileges = isChecked
                ? [...module.privileges, static_privilege.modules.find((m) => m.name === moduleName)?.privileges.find((p) => p.name === privilegeName)!]
                : module.privileges.filter((privilege) => privilege.name !== privilegeName);

            return { ...module, privileges: updatedPrivileges };
        });

        updateAccessibility({ modules: updatedModules });
    };

    const handleModuleChange = (moduleName: string, isChecked: boolean) => {
        if (!accessibility) return;

        const updatedModules = isChecked
            ? [...accessibility.modules, static_privilege.modules.find((m) => m.name === moduleName)!]
            : accessibility.modules.filter((module) => module.name !== moduleName);

        updateAccessibility({ modules: updatedModules });
    };

    const handleWebAccessChange = (isChecked: boolean) => {
        updateAccessibility({ web_access: isChecked });
    };

    if (!accessibility) {
        return <Spinner color="primary" content="Loading..." className="h-full w-full" />;
    }

    const isPrivilegeChecked = (moduleName: string, privilegeName: string) =>
        accessibility.modules.find((module) => module.name === moduleName)?.privileges.some((privilege) => privilege.name === privilegeName) || false;

    const isModuleChecked = (moduleName: string) =>
        accessibility.modules.some((module) => module.name === moduleName);

    return (
        <div>
            <div className="mb-4">
                <Checkbox
                    isSelected={accessibility.web_access}
                    onValueChange={(isChecked) => handleWebAccessChange(isChecked)}
                >
                    Web Access
                </Checkbox>
            </div>
            <div className="mb-4">
                <h2 className="text-medium font-semibold mb-2">Modules and Privileges</h2>
                {static_privilege.modules.map((module, index) => (
                    <Card key={index} shadow="none" className="border mb-2 p-2">
                        <Checkbox
                            isSelected={isModuleChecked(module.name)}
                            onValueChange={(isChecked) => handleModuleChange(module.name, isChecked)}
                        >
                            {module.name}
                        </Checkbox>
                        <div className="ml-6">
                            {module.privileges.map((privilege, privIndex) => (
                                <Checkbox
                                    key={privIndex}
                                    isSelected={isPrivilegeChecked(module.name, privilege.name)}
                                    onValueChange={(isChecked) =>
                                        handlePrivilegeChange(module.name, privilege.name, isChecked)
                                    }
                                    className="ml-2"
                                >
                                    {privilege.name}
                                    {/* <span className="text-sm text-gray-500 ml-2">({privilege.paths.join(", ")})</span> */}
                                </Checkbox>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
            {/* <Divider />
            <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Selected Privileges</h2>
                {accessibility.modules.map((module, index) => (
                    <div key={index} className="mb-2">
                        <div className="font-medium">{module.name}</div>
                        <ul className="ml-6 list-disc">
                            {module.privileges.map((privilege, privIndex) => (
                                <li key={privIndex}>
                                    {privilege.name}
                                    <span className="text-sm text-gray-500 ml-2">({privilege.paths.join(", ")})</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div> */}
        </div>
    );
}

export default PrivilegesList;
