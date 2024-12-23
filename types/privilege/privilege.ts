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
] as const;
export type ModuleNames = (typeof ModuleNamesArray)[number];

// Arrange accordingly
export const PrivilegeNamesArray = [
    "View Dashboard",
    "View Employees",
    "Read Attendance Logs",
    "Read Schedules",
    "Write Schedules",
    "Read Overtimes",
    "File Overtimes",
    "Approve Overtimes",
    "Read Holidays",
    "Write Holidays",
    "View Benefits",
    "Read Incidents",
    "File Incidents",
    "Read Leaves",
    "Read Earnings",
    "Read Deductions",
    "Write Earnings and Deductions",
    "Read Privileges",
    "Write Privileges",
    "View Signatories",
    "View Reports",
    "View Trainings and Seminars",
    "View Performance Appraisal",
    "View Tests"
] as const;
export type PrivilegeNames = (typeof PrivilegeNamesArray)[number];

export const static_privilege: UserPrivileges = {
    web_access: true,
    modules: [
        {
            name: "Dashboard",
            privileges: [{ name: "View Dashboard", paths: ["/dashboard"] }],
        },
        {
            name: "Employees",
            privileges: [{ name: "View Employees", paths: ["/employeemanagement"] }],
        },
        {
            name: "Attendance and Time",
            privileges: [
                { name: "Read Attendance Logs", paths: ["/attendance-time/records", "/api/admin/attendance-time/records/"] },
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
            privileges: [{ name: "View Benefits", paths: ["/benefits"] }],
        },
        {
            name: "Incident",
            privileges: [
                { name: "Read Incidents", paths: ["/incident", "/api/admin/incident/reports"] },
                { name: "File Incidents", paths: ["/api/admin/incident/update", "/api/admin/incident/create"] },
            ],
        },
        {
            name: "Leaves",
            privileges: [{ name: "Read Leaves", paths: ["/leaves"] }],
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
                { name: "Read Privileges", paths: ["/privileges/accessibility", "/api/admin/privilege"] },
                {
                    name: "Write Privileges",
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
            privileges: [{ name: "View Signatories", paths: ["/signatories"] }],
        },
        {
            name: "Reports",
            privileges: [{ name: "View Reports", paths: ["/reports"] }],
        },
        {
            name: "Trainings and Seminars",
            privileges: [{ name: "View Trainings and Seminars", paths: ["/trainings-and-seminars"] }],
        },
        {
            name: "Performance Appraisal",
            privileges: [{ name: "View Performance Appraisal", paths: ["/performance"] }],
        },
        {
            name: "Tests",
            privileges: [{ name: "View Tests", paths: ["/test"] }],
        },
    ],
};
