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

type Privileges = UserPrivileges["modules"][0]["privileges"]

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
    "Tests",
] as const; // `as const` preserves the string literal types

// The resulting type will be an array of literal types
export type ModuleNames = (typeof ModuleNamesArray)[number];

export const static_privilege: UserPrivileges = {
    web_access: true,
    modules: [
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
            privileges: [
                { name: "Read Logs", paths: ["/attendance-time/records", "/api/admin/attendance-time/records/"] },
                { name: "Read Schedules", paths: ["/attendance-time/schedule", "/api/admin/attendance-time/schedule"] },
                {
                    name: "Write Schedules",
                    paths: [
                        "/api/admin/attendance-time/schedule/add-schedule",
                        "/api/admin/attendance-time/schedule/edit-schedule",
                        "/api/admin/attendance-time/schedule/delete-schedule",
                    ],
                },
                { name: "Read Overtimes", paths: ["/attendance-time/overtime", "/api/admin/attendance-time/overtime"] },
                { name: "File Overtimes", paths: ["/api/admin/attendance-time/overtime/file"] },
                { name: "Approve Overtimes", paths: ["/api/admin/attendance-time/overtime/update"] },
                { name: "Read Holidays", paths: ["/attendance-time/holidays", "/api/admin/attendance-time/holidays"] },
                {
                    name: "Write Holidays",
                    paths: ["/api/admin/attendance-time/holidays/create", "/api/admin/attendance-time/holidays/delete"],
                },
            ],
        },
        {
            name: "Benefits",
            privileges: [{ name: "View", paths: ["/benefits"] }],
        },
        {
            name: "Incident",
            privileges: [
                { name: "Read", paths: ["/incident", "/api/admin/incident/reports"] },
                { name: "Write", paths: ["/api/admin/incident/update", "/api/admin/incident/create"] },
            ],
        },
        {
            name: "Leaves",
            privileges: [{ name: "View", paths: ["/leaves"] }],
        },
        {
            name: "Payroll",
            privileges: [
                {
                    name: "Read Earnings",
                    paths: [
                        "/payroll/earnings",
                        "/api/admin/payroll/payhead?type=earning",
                        "/payroll/earnings/manage",
                        "/api/admin/payroll/payhead/read",
                    ],
                },
                {
                    name: "Read Deductions",
                    paths: [
                        "/payroll/deductions",
                        "/api/admin/payroll/payhead?type=deduction",
                        "/payroll/deductions/manage",
                        "/api/admin/payroll/payhead/read",
                    ],
                },
                {
                    name: "Write Earnings and Deductions",
                    paths: ["/api/admin/payroll/payhead/upsert-payhead", "/api/admin/payroll/payhead/delete"],
                },
            ],
        },
        {
            name: "Privileges",
            privileges: [
                { name: "Read", paths: ["/privileges/accessibility", "/api/admin/privilege"] },
                {
                    name: "Write",
                    paths: [
                        "/api/admin/privilege/create-accessibility",
                        "/api/admin/privilege/update-accessibility",
                        "/api/admin/privilege/delete-accessibility",
                    ],
                },
            ],
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
            name: "Tests",
            privileges: [{ name: "View", paths: ["/test"] }],
        },
    ],
};
