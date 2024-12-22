import { MinorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { UserPrivileges } from "../JSON/user-privileges";

// Interface to represent access control for employees
interface AccessControl {
    trans_employees: MinorEmployee | null;
}

// Interface to represent the main data structure
export interface AccessRole {
    id: number;
    accessibility: UserPrivileges;
    name: string;
    created_at: string; // ISO 8601 date format
    updated_at: string; // ISO 8601 date format
    deleted_at: string | null; // ISO 8601 date format or null
    acl_user_access_control: AccessControl[];
}

export const ModuleNamesArray = [
    "Dashboard",
    "Employees",
    "Attendance and Time",
    "Benefits",
    "Incident",
    "Leaves",
    "Payroll",
    "Privileges",
    "Signatories",
    "Test",
    "Trainings and Seminars",
    "Performance Appraisal",
    "Reports",
    "APIs",
    "All",
    "Tests"
] as const; // `as const` preserves the string literal types

// The resulting type will be an array of literal types
export type ModuleNames = typeof ModuleNamesArray[number];

export const static_privilege: UserPrivileges = {
    web_access: true,
    modules: [
        {
            name: "All",
            privileges: [{ name: "View", paths: ["/"] }],
        },
        {
            name: "Dashboard",
            privileges: [{ name: "View", paths: ["/dashboard"] }],
        },
        {
            name: "Employees",
            privileges: [{ name: "View", paths: ["/employeemanagement"] }],
        },
        {
            name: "Attendance and Time",
            privileges: [{ name: "View", paths: ["/attendance-time"] }],
        },
        {
            name: "Benefits",
            privileges: [{ name: "View", paths: ["/benefits"] }],
        },
        {
            name: "Incident",
            privileges: [{ name: "View", paths: ["/incident"] }],
        },
        {
            name: "Leaves",
            privileges: [{ name: "View", paths: ["/leaves"] }],
        },
        {
            name: "Payroll",
            privileges: [{ name: "View", paths: ["/payroll"] }],
        },
        {
            name: "Privileges",
            privileges: [{ name: "View", paths: ["/privileges"] }],
        },
        {
            name: "Signatories",
            privileges: [{ name: "View", paths: ["/signatories"] }],
        },
        {
            name: "Reports",
            privileges: [{ name: "View", paths: ["/reports"] }],
        },
        {
            name: "Trainings and Seminars",
            privileges: [{ name: "View", paths: ["/trainings-and-seminars"] }],
        },
        {
            name: "Performance Appraisal",
            privileges: [{ name: "View", paths: ["/performance"] }],
        },
        {
            name: "APIs",
            privileges: [{ name: "View", paths: ["/api"] }],
        },
        {
            name: "Tests",
            privileges: [{ name: "View", paths: ["/test"] }],
        },
    ],
};
