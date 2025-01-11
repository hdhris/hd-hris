import {PrismaClient} from '@prisma/client';
import {toGMT8} from '../../../lib/utils/toGMT8';
import address from '../json/address.json'
import {seedAddress} from "../admin/address/seed";
import {seedSchedule} from "@/prisma/seed/admin/schedule/seed";

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seeding process...');

    await prisma.$transaction(async (tx) => {
        // Insert into ref_branches
        console.log('Seeding ref_branches...');
        await tx.ref_branches.createMany({
            data: [{
                name: 'Koronadal Branch',
                addr_region: 12,
                addr_province: 1263,
                addr_municipal: 126306,
                addr_baranggay: 126306018,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            }, {
                name: 'Gensan Branch',
                addr_region: 12,
                addr_province: 1263,
                addr_municipal: 126303,
                addr_baranggay: 126303004,
                is_active: false,
                created_at: new Date(),
                updated_at: new Date(),
            },],
        });
        console.log('Seeding ref_branches completed.');

        // Insert into ref_departments
        console.log('Seeding ref_departments...');
        await tx.ref_departments.createMany({
            data: [{
                name: 'Warehouse',
                color: '#33C4FF',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            }, {
                name: 'Headquarters',
                color: '#33FF57',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            }, {
                name: 'Human Resource',
                color: '#4f46e5',
                is_active: false,
                created_at: new Date(),
                updated_at: new Date(),
            }, {
                name: 'MIS',
                color: '#2f2a83',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            }, {
                name: 'Sales',
                color: '#e64c4c',
                is_active: false,
                created_at: new Date(),
                updated_at: new Date(),
            },],
        });
        console.log('Seeding ref_departments completed.');

        // Insert into ref_employment_status
        console.log('Seeding ref_employment_status...');
        await tx.ref_employment_status.createMany({
            data: [{
                name: 'Probationary',
                appraisal_interval: 6,
                superior_id: 23,
                created_at: new Date(),
                updated_at: new Date(),
            }, {
                name: 'Permanent/Regular',
                appraisal_interval: 4,
                superior_id: null,
                created_at: new Date(),
                updated_at: new Date(),
            },],
        });
        console.log('Seeding ref_employment_status completed.');

        // Insert into ref_address
        console.log('Seeding ref_address...');
       await seedAddress(tx)
        // Insert into ref_job_classes
        // console.log('Seeding ref_job_classes...');
        // await tx.ref_job_classes.createMany({
        //     data: [{
        //         name: "Chief Executive Officer",
        //        superior_id: null,
        //         is_active: true,
        //         created_at: new Date(),
        //         updated_at: new Date(),
        //         max_employees: 1,
        //         max_department_instances: 1,
        //         is_superior: true,
        //         department_id: null,
        //         max_salary: 0,
        //         min_salary: 0
        //     }, {
        //         name: "Human Resource Manager",
        //        superior_id: null,
        //         is_active: true,
        //         created_at: new Date(),
        //         updated_at: new Date(),
        //         max_employees: 2,
        //         max_department_instances: 1,
        //         is_superior: true,
        //         department_id: null,
        //         max_salary: 0,
        //         min_salary: 0
        //     }, {
        //         name: "Immediate Superior",
        //        superior_id: null,
        //         is_active: true,
        //         created_at: "2024-12-20 02:41:41.990145",
        //         updated_at: new Date(),
        //         max_employees: null,
        //         max_department_instances: 1,
        //         is_superior: true,
        //         department_id: null,
        //         max_salary: 0,
        //         min_salary: 0
        //     }, {
        //         name: "Staff",
        //        superior_id: null,
        //         is_active: true,
        //         created_at: "2024-12-20 05:50:31.752485",
        //         updated_at: new Date(),
        //         max_employees: null,
        //         max_department_instances: 0,
        //         is_superior: false,
        //         department_id: null,
        //         max_salary: 0,
        //         min_salary: 0
        //     },{
        //         name: "Finance manager",
        //        superior_id: null,
        //         is_active: true,
        //         created_at: new Date(),
        //         updated_at: new Date(),
        //         max_employees: 5,
        //         max_department_instances: 3,
        //         is_superior: false,
        //         department_id: null,
        //         max_salary: 0,
        //         min_salary: 0
        //     }, {
        //         name: "Chief Executive Officer",
        //        superior_id: null,
        //         is_active: true,
        //         created_at: new Date(),
        //         updated_at: new Date(),
        //         max_employees: 1,
        //         max_department_instances: 1,
        //         is_superior: true,
        //         department_id: null,
        //         max_salary: 0,
        //         min_salary: 0
        //     }
        //         // Add more job classes as needed...
        //     ],
        // });
        // console.log('Seeding ref_job_classes completed.');

        // Insert into ref_salary_grades
        console.log('Seeding ref_salary_grades...');
        await tx.ref_salary_grades.createMany({
            data: [{
                name: "SG9",
                amount: 22219,
                created_at: new Date(),
                updated_at: new Date(),
                rate_per_hour: 854.57
            }, {
                name: "SG8",
                amount: 20534,
                created_at: new Date(),
                updated_at: new Date(),
                rate_per_hour: 789
            }, {
                name: "SG7",
                amount: 19365,
                created_at: new Date(),
                updated_at: new Date(),
                rate_per_hour: 744.8
            }, {
                name: "SG12",
                amount: 18255,
                created_at: new Date(),
                updated_at: new Date(),
                rate_per_hour: 702.11
            }
                // Add more salary grades as needed...
            ],
        });
        console.log('Seeding ref_salary_grades completed.');

        // Insert into ref_signatory_paths
        console.log('Seeding ref_signatory_paths...');
        await tx.ref_signatory_paths.createMany({
            data: [{
                signatories_path: '/overtime/requests',
                created_at: new Date(),
                updated_at: new Date(),
                signatories_name: 'Overtime',
            }, {
                signatories_path: '/leaves/leave-requests',
                created_at: new Date(),
                updated_at: new Date(),
                signatories_name: 'Leave Request',
            }, // Add more signatory paths as needed...
            ],
        });
        console.log('Seeding ref_signatory_paths completed.');

        // Insert into ref_signatory_roles
        console.log('Seeding ref_signatory_roles...');
        await tx.ref_signatory_roles.createMany({
            data: [{
                signatory_role_name: 'Approver', created_at: new Date(), updated_at: new Date(),
            }, {
                signatory_role_name: 'Reviewer', created_at: new Date(), updated_at: new Date(),
            }, // Add more signatory roles as needed...
            ],
        });
        console.log('Seeding ref_signatory_roles completed.');

        console.log('Seeding ref_payheads...');
        await tx.ref_payheads.createMany({
            data: [
                {
                    id: 1,
                    name: 'Basic Salary',
                    type: 'earning',
                    affected_json: JSON.stringify({
                        mandatory: 'all',
                        departments: 'all',
                        job_classes: 'all',
                        employees: 'all',
                    }),
                    variable: null,
                    is_overwritable: false,
                    system_only: true,
                    is_active: true,
                    created_at: new Date('2024-12-18T03:32:47.300Z'),
                    updated_at: new Date('2024-12-18T03:25:43.400Z'),
                    deleted_at: null,
                },
                {
                    id: 2,
                    name: 'Cash Disbursement',
                    type: 'earning',
                    affected_json: JSON.stringify({
                        mandatory: 'all',
                        departments: 'all',
                        job_classes: 'all',
                        employees: 'all',
                    }),
                    variable: null,
                    is_overwritable: true,
                    system_only: true,
                    is_active: true,
                    created_at: new Date('2024-12-18T03:32:47.300Z'),
                    updated_at: new Date('2024-12-18T03:32:47.300Z'),
                    deleted_at: null,
                },
                {
                    id: 8,
                    name: 'Paid Leaves',
                    type: 'earning',
                    affected_json: JSON.stringify({
                        employees: 'all',
                        mandatory: 'all',
                        departments: 'all',
                        job_classes: 'all',
                    }),
                    variable: null,
                    is_overwritable: false,
                    system_only: true,
                    is_active: true,
                    created_at: new Date('2024-12-25T19:16:00.000Z'),
                    updated_at: new Date('2024-12-25T19:16:00.000Z'),
                    deleted_at: null,
                },
                {
                    id: 9,
                    name: 'Paid Overtimes',
                    type: 'earning',
                    affected_json: JSON.stringify({
                        employees: 'all',
                        mandatory: 'all',
                        departments: 'all',
                        job_classes: 'all',
                    }),
                    variable: null,
                    is_overwritable: false,
                    system_only: true,
                    is_active: true,
                    created_at: new Date('2024-12-25T19:16:00.000Z'),
                    updated_at: new Date('2024-12-25T19:16:00.000Z'),
                    deleted_at: null,
                },
                {
                    id: 3,
                    name: 'Cash Repayment',
                    type: 'deduction',
                    affected_json: JSON.stringify({
                        mandatory: 'all',
                        departments: 'all',
                        job_classes: 'all',
                        employees: 'all',
                    }),
                    variable: null,
                    is_overwritable: true,
                    system_only: true,
                    is_active: true,
                    created_at: new Date('2024-12-18T03:32:47.300Z'),
                    updated_at: new Date('2024-12-18T03:32:47.300Z'),
                    deleted_at: null,
                },
                {
                    id: 7,
                    name: 'Tardiness and Absences',
                    type: 'deduction',
                    affected_json: JSON.stringify({
                        employees: 'all',
                        mandatory: 'all',
                        departments: 'all',
                        job_classes: 'all',
                    }),
                    variable: null,
                    is_overwritable: false,
                    system_only: true,
                    is_active: true,
                    created_at: new Date('2024-12-25T19:16:00.000Z'),
                    updated_at: new Date('2024-12-25T19:16:00.000Z'),
                    deleted_at: null,
                },
            ],
        });
        console.log('Seeding ref_payheads completed.');

        // Insert into sys_notification_types
        console.log('Seeding sys_notification_types...');
        await tx.sys_notification_types.createMany({
            data: [{
                type_name: "System Alert", description: "General system-related notifications."
            }, {
                type_name: "Task Assignment", description: "Notifications for new tasks assigned."
            }, {
                type_name: "Reminder", description: "Notification to remind about deadlines."
            }, {
                type_name: "Message", description: "Notifications for new messages."
            }, {
                type_name: "Announcement", description: "Organization-wide announcements."
            }, {
                type_name: "Warning", description: "Notifications for warnings or issues."
            }, {
                type_name: "Error", description: "Notifications for critical errors."
            }, {
                type_name: "Promotion", description: "Promotional notifications or offers."
            }
                // Add more notification types as needed...
            ],
        });
        console.log('Seeding sys_notification_types completed.');

        console.log('Seeding privileges...');

        await tx.sys_privileges.createMany({
            data: [
                {
                    id: 17,
                    accessibility: {
                        modules: [
                            {
                                name: 'Dashboard',
                                privileges: [
                                    {
                                        name: 'View Dashboard',
                                        paths: ['/dashboard'],
                                    },
                                ],
                            },
                            {
                                name: 'Employees',
                                privileges: [
                                    {
                                        name: 'View Employees',
                                        paths: ['/employeemanagement'],
                                    },
                                ],
                            },
                            {
                                name: 'Attendance and Time',
                                privileges: [
                                    {
                                        name: 'Read Attendance Logs',
                                        paths: [
                                            '/attendance-time/records',
                                            '/api/admin/attendance-time/records/',
                                        ],
                                    },
                                    {
                                        name: 'Read Schedules',
                                        paths: [
                                            '/attendance-time/schedule',
                                            '/api/admin/attendance-time/schedule',
                                        ],
                                    },
                                    {
                                        name: 'Write Schedules',
                                        paths: [
                                            '/api/admin/attendance-time/schedule/add-schedule',
                                            '/api/admin/attendance-time/schedule/edit-schedule',
                                            '/api/admin/attendance-time/schedule/delete-schedule',
                                        ],
                                    },
                                    {
                                        name: 'Read Overtimes',
                                        paths: [
                                            '/attendance-time/overtime',
                                            '/api/admin/attendance-time/overtime',
                                        ],
                                    },
                                    {
                                        name: 'File Overtimes',
                                        paths: ['/api/admin/attendance-time/overtime/file'],
                                    },
                                    {
                                        name: 'Approve Overtimes',
                                        paths: ['/api/admin/attendance-time/overtime/update'],
                                    },
                                    {
                                        name: 'Read Holidays',
                                        paths: [
                                            '/attendance-time/holidays',
                                            '/api/admin/attendance-time/holidays',
                                        ],
                                    },
                                    {
                                        name: 'Write Holidays',
                                        paths: [
                                            '/api/admin/attendance-time/holidays/upsert',
                                            '/api/admin/attendance-time/holidays/delete',
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'Benefits',
                                privileges: [
                                    {
                                        name: 'View Benefits',
                                        paths: ['/benefits'],
                                    },
                                ],
                            },
                            {
                                name: 'Incident',
                                privileges: [
                                    {
                                        name: 'Read Incidents',
                                        paths: ['/incident', '/api/admin/incident/reports'],
                                    },
                                    {
                                        name: 'File Incidents',
                                        paths: [
                                            '/api/admin/incident/update',
                                            '/api/admin/incident/upsert',
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'Leaves',
                                privileges: [
                                    {
                                        name: 'Read Leaves',
                                        paths: ['/leaves'],
                                    },
                                ],
                            },
                            {
                                name: 'Payroll',
                                privileges: [
                                    {
                                        name: 'Read Earnings',
                                        paths: [
                                            '/payroll/earnings',
                                            '/api/admin/payroll/payhead?type=earning',
                                            '/payroll/earnings/manage',
                                            '/api/admin/payroll/payhead/read',
                                        ],
                                    },
                                    {
                                        name: 'Read Deductions',
                                        paths: [
                                            '/payroll/deductions',
                                            '/api/admin/payroll/payhead?type=deduction',
                                            '/payroll/deductions/manage',
                                            '/api/admin/payroll/payhead/read',
                                        ],
                                    },
                                    {
                                        name: 'Write Earnings and Deductions',
                                        paths: [
                                            '/api/admin/payroll/payhead/upsert-payhead',
                                            '/api/admin/payroll/payhead/delete',
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'Privileges',
                                privileges: [
                                    {
                                        name: 'Read Privileges',
                                        paths: [
                                            '/privileges/accessibility',
                                            '/api/admin/privilege',
                                        ],
                                    },
                                    {
                                        name: 'Write Privileges',
                                        paths: [
                                            '/api/admin/privilege/upsert-accessibility',
                                            '/api/admin/privilege/update-accessibility',
                                            '/api/admin/privilege/delete-accessibility',
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'Signatories',
                                privileges: [
                                    {
                                        name: 'View Signatories',
                                        paths: ['/signatories'],
                                    },
                                ],
                            },
                            {
                                name: 'Reports',
                                privileges: [
                                    {
                                        name: 'View Reports',
                                        paths: ['/reports'],
                                    },
                                ],
                            },
                            {
                                name: 'Trainings and Seminars',
                                privileges: [
                                    {
                                        name: 'View Trainings and Seminars',
                                        paths: ['/trainings-and-seminars'],
                                    },
                                ],
                            },
                            {
                                name: 'Performance Appraisal',
                                privileges: [
                                    {
                                        name: 'View Performance Appraisal',
                                        paths: ['/performance'],
                                    },
                                ],
                            },
                            {
                                name: 'Tests',
                                privileges: [
                                    {
                                        name: 'View Tests',
                                        paths: ['/test'],
                                    },
                                ],
                            },
                        ],
                        web_access: true,
                    },
                    name: 'Admin Access',
                    created_at: new Date('2024-12-18T03:32:40.199Z'),
                    updated_at: new Date('2024-12-28T03:56:41.872Z'),
                    deleted_at: null,
                },
                {
                    id: 19,
                    accessibility: {
                        modules: [
                            {
                                name: 'Dashboard',
                                privileges: [
                                    {
                                        name: 'View Dashboard',
                                        paths: ['/dashboard'],
                                    },
                                ],
                            },
                            {
                                name: 'Employees',
                                privileges: [
                                    {
                                        name: 'View Employees',
                                        paths: ['/employeemanagement'],
                                    },
                                ],
                            },
                            {
                                name: 'Attendance and Time',
                                privileges: [
                                    {
                                        name: 'Read Attendance Logs',
                                        paths: [
                                            '/attendance-time/records',
                                            '/api/admin/attendance-time/records/',
                                        ],
                                    },
                                    {
                                        name: 'Read Schedules',
                                        paths: [
                                            '/attendance-time/schedule',
                                            '/api/admin/attendance-time/schedule',
                                        ],
                                    },
                                    {
                                        name: 'Write Schedules',
                                        paths: [
                                            '/api/admin/attendance-time/schedule/add-schedule',
                                            '/api/admin/attendance-time/schedule/edit-schedule',
                                            '/api/admin/attendance-time/schedule/delete-schedule',
                                        ],
                                    },
                                    {
                                        name: 'Read Overtimes',
                                        paths: [
                                            '/attendance-time/overtime',
                                            '/api/admin/attendance-time/overtime',
                                        ],
                                    },
                                    {
                                        name: 'File Overtimes',
                                        paths: ['/api/admin/attendance-time/overtime/file'],
                                    },
                                    {
                                        name: 'Approve Overtimes',
                                        paths: ['/api/admin/attendance-time/overtime/update'],
                                    },
                                    {
                                        name: 'Read Holidays',
                                        paths: [
                                            '/attendance-time/holidays',
                                            '/api/admin/attendance-time/holidays',
                                        ],
                                    },
                                    {
                                        name: 'Write Holidays',
                                        paths: [
                                            '/api/admin/attendance-time/holidays/upsert',
                                            '/api/admin/attendance-time/holidays/delete',
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'Benefits',
                                privileges: [
                                    {
                                        name: 'View Benefits',
                                        paths: ['/benefits'],
                                    },
                                ],
                            },
                            {
                                name: 'Incident',
                                privileges: [
                                    {
                                        name: 'Read Incidents',
                                        paths: ['/incident', '/api/admin/incident/reports'],
                                    },
                                    {
                                        name: 'File Incidents',
                                        paths: [
                                            '/api/admin/incident/update',
                                            '/api/admin/incident/upsert',
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'Leaves',
                                privileges: [
                                    {
                                        name: 'Read Leaves',
                                        paths: ['/leaves'],
                                    },
                                ],
                            },
                            {
                                name: 'Payroll',
                                privileges: [
                                    {
                                        name: 'Read Earnings',
                                        paths: [
                                            '/payroll/earnings',
                                            '/api/admin/payroll/payhead?type=earning',
                                            '/payroll/earnings/manage',
                                            '/api/admin/payroll/payhead/read',
                                        ],
                                    },
                                    {
                                        name: 'Read Deductions',
                                        paths: [
                                            '/payroll/deductions',
                                            '/api/admin/payroll/payhead?type=deduction',
                                            '/payroll/deductions/manage',
                                            '/api/admin/payroll/payhead/read',
                                        ],
                                    },
                                    {
                                        name: 'Write Earnings and Deductions',
                                        paths: [
                                            '/api/admin/payroll/payhead/upsert-payhead',
                                            '/api/admin/payroll/payhead/delete',
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'Privileges',
                                privileges: [
                                    {
                                        name: 'Read Privileges',
                                        paths: [
                                            '/privileges/accessibility',
                                            '/api/admin/privilege',
                                        ],
                                    },
                                    {
                                        name: 'Write Privileges',
                                        paths: [
                                            '/api/admin/privilege/upsert-accessibility',
                                            '/api/admin/privilege/update-accessibility',
                                            '/api/admin/privilege/delete-accessibility',
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'Signatories',
                                privileges: [
                                    {
                                        name: 'View Signatories',
                                        paths: ['/signatories'],
                                    },
                                ],
                            },
                            {
                                name: 'Reports',
                                privileges: [
                                    {
                                        name: 'View Reports',
                                        paths: ['/reports'],
                                    },
                                ],
                            },
                            {
                                name: 'Trainings and Seminars',
                                privileges: [
                                    {
                                        name: 'View Trainings and Seminars',
                                        paths: ['/trainings-and-seminars'],
                                    },
                                ],
                            },
                            {
                                name: 'Performance Appraisal',
                                privileges: [
                                    {
                                        name: 'View Performance Appraisal',
                                        paths: ['/performance'],
                                    },
                                ],
                            },
                            {
                                name: 'Tests',
                                privileges: [
                                    {
                                        name: 'View Tests',
                                        paths: ['/test'],
                                    },
                                ],
                            },
                        ],
                        web_access: true,
                    },
                    name: 'HR Management',
                    created_at: new Date('2024-12-18T03:32:45.290Z'),
                    updated_at: new Date('2024-12-27T02:32:48.819Z'),
                    deleted_at: null,
                },
                {
                    id: 22,
                    accessibility: {
                        modules: [
                            {
                                name: 'Dashboard',
                                privileges: [
                                    {
                                        name: 'View Dashboard',
                                        paths: ['/dashboard'],
                                    },
                                ],
                            },
                            {
                                name: 'Employees',
                                privileges: [
                                    {
                                        name: 'View Employees',
                                        paths: ['/employeemanagement'],
                                    },
                                ],
                            },
                        ],
                        web_access: true,
                    },
                    name: 'Initial Account',
                    created_at: new Date('2024-12-23T00:20:42.449Z'),
                    updated_at: new Date('2024-12-23T02:50:44.892Z'),
                    deleted_at: null,
                },
            ],
        });

        console.log('Seeding privileges completed.');

        // Insert into trans_users
        console.log('Seeding trans_users...');
        await tx.trans_users.create({
            data: {
                id: '00a29860-665d-4794-88eb-c12d183b76b3',
                name: 'Admin',
                email: 'admin@gmail.com',
                emailVerified: null,
                image: 'https://files.edgestore.dev/6bc0cgi3ynpz46db/publicFiles/_public/7f0e37fb-e9f5-4f09-8047-ce3b33d53904.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
                preferences: {},
            },
        });
        console.log('Seeding trans_users completed.');

        // Insert into auth_credentials
        console.log('Seeding auth_credentials...');
        await tx.auth_credentials.create({
            data: {
                username: 'admin',
                password: 'yKURmlV86w3oRh2wDj8iJg==:AgUP0SV4EVIafSOqOxtbqA==',
                created_at: new Date(),
                updated_at: null,
                user_id: '00a29860-665d-4794-88eb-c12d183b76b3',
            },
        });
        console.log('Seeding auth_credentials completed.');

        // Insert into acl_user_access_control
        console.log('Seeding acl_user_access_control...');
        await tx.acl_user_access_control.create({
            data: {
                employee_id: null,
                privilege_id: 17,
                banned_til: null,
                created_at: new Date(),
                update_at: null,
                user_id: '00a29860-665d-4794-88eb-c12d183b76b3',
            },
        });
        console.log('Seeding acl_user_access_control completed.');

        // Insert into dim_schedules
        // console.log('Seeding schedule...');
        // await seedSchedule(tx);
        // console.log('Seeding dim_schedules completed.');

        // Insert into ref_batch_schedules
        console.log('Seeding ref_batch_schedules...');
        await tx.ref_batch_schedules.createMany({
            data: [{
                name: 'Opening Batch',
                clock_in: toGMT8('08:00:00').toISOString(),
                clock_out: toGMT8('17:00:00').toISOString(),
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
                break_min: 60,
            }, {
                name: 'Closing Batch',
                clock_in: toGMT8('09:00:00').toISOString(),
                clock_out: toGMT8('18:00:00').toISOString(),
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
                break_min: 60,
            },],
        });
        console.log('Seeding ref_batch_schedules completed.');

        // Insert into trans_signatories
        console.log('Seeding trans_signatories...');
        // await tx.trans_signatories.createMany({
        //     data: [
        //     {
        //         id: 1,
        //         job_id: 12,
        //         signatory_role_id: 2,
        //         signatory_path_id: 2,
        //         order_number: 1,
        //         created_at: new Date('2024-12-20T07:24:31.491Z'),
        //         updated_at: new Date('2024-12-20T07:24:31.491Z'),
        //         is_apply_to_all_signatory: false,
        //     },
        //     {
        //         id: 2,
        //         job_id: 11,
        //         signatory_role_id: 1,
        //         signatory_path_id: 2,
        //         order_number: 2,
        //         created_at: new Date('2024-12-20T07:24:50.924Z'),
        //         updated_at: new Date('2024-12-20T07:24:50.924Z'),
        //         is_apply_to_all_signatory: true,
        //     },
        //     {
        //         id: 3,
        //         job_id: 10,
        //         signatory_role_id: 1,
        //         signatory_path_id: 2,
        //         order_number: 3,
        //         created_at: new Date('2024-12-20T07:25:19.130Z'),
        //         updated_at: new Date('2024-12-20T07:25:19.130Z'),
        //         is_apply_to_all_signatory: true,
        //     },
        //     {
        //         id: 4,
        //         job_id: 11,
        //         signatory_role_id: 1,
        //         signatory_path_id: 1,
        //         order_number: 2,
        //         created_at: new Date('2024-12-20T08:21:09.927Z'),
        //         updated_at: new Date('2024-12-20T08:21:09.927Z'),
        //         is_apply_to_all_signatory: true,
        //     },
        //     {
        //         id: 5,
        //         job_id: 12,
        //         signatory_role_id: 2,
        //         signatory_path_id: 1,
        //         order_number: 1,
        //         created_at: new Date('2024-12-20T08:24:15.012Z'),
        //         updated_at: new Date('2024-12-20T08:24:15.012Z'),
        //         is_apply_to_all_signatory: false,
        //     },
        //     {
        //         id: 6,
        //         job_id: 20,
        //         signatory_role_id: 3,
        //         signatory_path_id: 4,
        //         order_number: 1,
        //         created_at: new Date('2024-12-24T06:21:10.044Z'),
        //         updated_at: new Date('2024-12-24T06:21:10.044Z'),
        //         is_apply_to_all_signatory: true,
        //     },
        //     {
        //         id: 7,
        //         job_id: 11,
        //         signatory_role_id: 1,
        //         signatory_path_id: 4,
        //         order_number: 2,
        //         created_at: new Date('2024-12-24T06:21:26.370Z'),
        //         updated_at: new Date('2024-12-24T06:21:26.370Z'),
        //         is_apply_to_all_signatory: true,
        //     },
        //     {
        //         id: 8,
        //         job_id: 26,
        //         signatory_role_id: 2,
        //         signatory_path_id: 5,
        //         order_number: 1,
        //         created_at: new Date('2024-12-27T08:23:31.037Z'),
        //         updated_at: new Date('2024-12-27T08:23:31.037Z'),
        //         is_apply_to_all_signatory: false,
        //     },
        //     {
        //         id: 9,
        //         job_id: 11,
        //         signatory_role_id: 1,
        //         signatory_path_id: 5,
        //         order_number: 2,
        //         created_at: new Date('2024-12-27T08:23:58.925Z'),
        //         updated_at: new Date('2024-12-27T08:23:58.925Z'),
        //         is_apply_to_all_signatory: true,
        //     },
        //     {
        //         id: 10,
        //         job_id: 10,
        //         signatory_role_id: 1,
        //         signatory_path_id: 1,
        //         order_number: 2,
        //         created_at: new Date('2024-12-30T03:11:18.370Z'),
        //         updated_at: new Date('2024-12-30T03:11:18.370Z'),
        //         is_apply_to_all_signatory: true,
        //     },
        //     {
        //         id: 11,
        //         job_id: 10,
        //         signatory_role_id: 1,
        //         signatory_path_id: 4,
        //         order_number: 3,
        //         created_at: new Date('2024-12-30T03:11:46.927Z'),
        //         updated_at: new Date('2024-12-30T03:11:46.927Z'),
        //         is_apply_to_all_signatory: true,
        //     },
        // ],
        // });
        console.log('Seeding trans_signatories completed.');
    }, {
        timeout: 60000
    });

    console.log('Seeding process completed successfully.');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });