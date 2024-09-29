"use client";
import React, { useState } from "react";

// Privilege interface
interface Privilege {
  access: boolean;
  web: {
    access: boolean;
    payroll: {
      access: boolean;
      process: {
        access: boolean;
        view_process: boolean;
        process_payroll: boolean;
        deploy_payroll: boolean;
      };
    };
    attendance: {
      access: boolean;
      records: {
        access: boolean;
        view_logs: boolean;
      };
      schedule: {
        access: boolean;
        create_schedule: boolean;
        read_schedule: boolean;
      };
    };
  };
}

// Initial privilege data
const initialPrivilegeData: Privilege = {
  access: true,
  web: {
    access: true,
    payroll: {
      access: true,
      process: {
        access: true,
        view_process: true,
        process_payroll: true,
        deploy_payroll: true,
      },
    },
    attendance: {
      access: true,
      records: {
        access: true,
        view_logs: true,
      },
      schedule: {
        access: true,
        create_schedule: true,
        read_schedule: true,
      },
    },
  },
};

// Recursive Component to Render the Checkboxes
const PrivilegeTree: React.FC<{
  privileges: any;
  path: string[];
  onChange: (path: string[], value: boolean) => void;
}> = ({ privileges, path, onChange }) => {
  return (
    <ul>
      {Object.keys(privileges).map((key) => {
        const value = privileges[key];
        const currentPath = [...path, key];

        // If the value is a boolean, it's a checkbox
        if (typeof value === "boolean") {
          return (
            <li key={key}>
              <label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => onChange(currentPath, !value)}
                />
                {key}
              </label>
            </li>
          );
        }

        // If the value is an object, render recursively
        if (typeof value === "object" && value !== null) {
          return (
            <li key={key}>
              <label>{key}</label>
              <PrivilegeTree
                privileges={value}
                path={currentPath}
                onChange={onChange}
              />
            </li>
          );
        }

        return null;
      })}
    </ul>
  );
};

// Main Component
const PrivilegeCheckboxes = () => {
  const [privileges, setPrivileges] = useState<Privilege>(initialPrivilegeData);

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
  };

  return (
    <div>
      <h2>Privilege Settings</h2>
      <PrivilegeTree
        privileges={privileges}
        path={[]}
        onChange={handleCheckboxChange}
      />
    </div>
  );
};

export default PrivilegeCheckboxes;
