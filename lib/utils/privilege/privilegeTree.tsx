"use client";
import React, { useState } from "react";
import {
  Checkbox,
  Spacer,
  Listbox,
  ListboxItem,
  Button,
} from "@nextui-org/react";
import { Privilege, privilegeData } from "./exampleData";

// Recursive Component to Render the Checkboxes
const PrivilegeTree: React.FC<{
  privileges: any;
  path: string[];
  onChange: (path: string[], value: boolean) => void;
  isDisabled: boolean;
}> = ({ privileges, path, onChange, isDisabled }) => {
  return (
    <ul>
      {Object.keys(privileges).map((key) => {
        const value = privileges[key];
        const currentPath = [...path, key];

        // If the value is a boolean, it's a checkbox
        if (typeof value === "boolean" && key !== "access") {
          return (
            <li key={key} style={{ marginLeft: "20px" }}>
              <Checkbox
                isSelected={value}
                onChange={() => onChange(currentPath, !value)}
                isDisabled={isDisabled}
              >
                {key}
              </Checkbox>
            </li>
          );
        }

        // If the value is an object, render recursively
        if (typeof value === "object" && value !== null) {
          const parentAccess = value["access"] as boolean;
          return (
            <li key={key} style={{ marginLeft: "20px" }}>
              <Checkbox
                isSelected={parentAccess}
                onChange={() =>
                  onChange([...currentPath, "access"], !parentAccess)
                }
                isDisabled={isDisabled}
              >
                {key}
              </Checkbox>
              {parentAccess && (
                <PrivilegeTree
                  privileges={value}
                  path={currentPath}
                  onChange={onChange}
                  isDisabled={!parentAccess || isDisabled}
                />
              )}
            </li>
          );
        }

        return null;
      })}
    </ul>
  );
};

// Main Component
export const PrivilegeCheckboxes = () => {
  const [privileges, setPrivileges] = useState<Privilege>(privilegeData);

  function createProxy<T extends object>(target: T): T {
    return new Proxy(target, {
      get(obj, prop: string | symbol) {
        // If the property exists in the object
        if (typeof prop === "string" && prop in obj) {
          const value = obj[prop as keyof T];

          // If the value is an object, check if it has 'access'
          if (
            typeof value === "object" &&
            value !== null &&
            "access" in value
          ) {
            // If access is true, recursively proxy the nested object
            return (value as any).access ? createProxy(value) : false;
          }

          // Otherwise, return the value as it is
          return value;
        }
        return undefined;
      },
    });
  }

  // Custom hook to fetch privileges
  function usePrivilege(): Privilege["web"] {
    return createProxy(privileges.web);
  }

  function PrivilegePage() {
    const privilege = usePrivilege().payroll; // Get web privileges

    // Check if the payroll access
    if (privilege) {
      // Render Payroll module
      return (
        <div>
          <h1>Payroll</h1>
          {privilege.process ? (
            // Has access to payroll processing module
            <>
              <p>List of payrolls</p>
              {privilege.process.view_process ? (
                <Listbox
                  aria-label="Multiple selection example"
                  variant="flat"
                  disallowEmptySelection
                  selectionMode="multiple"
                >
                  <ListboxItem key="text">
                    <div className="flex gap-4">
                      <p>Employee 1</p>
                      {privilege.process.process_payroll && (
                        // Has access to payslips
                        <Button className="rounded-full" color="primary" size="sm">Edit</Button>
                      )}
                    </div>
                  </ListboxItem>
                </Listbox>
              ):'No access to list'}
              {privilege.process.deploy_payroll && (
                // Can deploy payroll
                <Button>Deploy All</Button>
              )}
            </>
          ) : (
            "No access. (router returns to dashboards)"
          )}
        </div>
      );
    }

    // If no payroll access, return not found
    return <div>404 not found</div>;
  }

  // Update function to handle checkbox changes
  const handleCheckboxChange = (path: string[], value: boolean) => {
    setPrivileges((prevPrivileges) => {
      const newPrivileges = { ...prevPrivileges };
      let obj: any = newPrivileges;

      // Traverse the object to the target property
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]];
      }

      // Set the new boolean value
      obj[path[path.length - 1]] = value;

      return newPrivileges;
    });
    console.log(privileges);
  };

  return (
    <div className="flex gap-4">
      <div>
        <h2>Privilege Settings</h2>
        <Spacer y={1} />
        <PrivilegeTree
          privileges={privileges.web}
          path={["web"]}
          onChange={handleCheckboxChange}
          isDisabled={false}
        />
      </div>
      <PrivilegePage />
    </div>
  );
};
