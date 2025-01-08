import {PrismaClient} from '@prisma/client';
import {toGMT8} from '@/lib/utils/toGMT8';

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
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
            }, {
                name: 'Gensan Branch',
                addr_region: 12,
                addr_province: 1263,
                addr_municipal: 126303,
                addr_baranggay: 126303004,
                is_active: false,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
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
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
            }, {
                name: 'Headquarters',
                color: '#33FF57',
                is_active: true,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
            }, {
                name: 'Human Resource',
                color: '#4f46e5',
                is_active: false,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
            }, {
                name: 'MIS',
                color: '#2f2a83',
                is_active: true,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
            }, {
                name: 'Sales',
                color: '#e64c4c',
                is_active: false,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
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
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
            }, {
                name: 'Permanent/Regular',
                appraisal_interval: 4,
                superior_id: null,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
            },],
        });
        console.log('Seeding ref_employment_status completed.');

        // Insert into ref_job_classes
        console.log('Seeding ref_job_classes...');
        await tx.ref_job_classes.createMany({
            data: [{
                "name": "Chief Executive Officer",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 1,
                "max_department_instances": 1,
                "is_superior": true,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Human Resource Manager",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 2,
                "max_department_instances": 1,
                "is_superior": true,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Immediate Superior",
                "superior_id": null,
                "is_active": true,
                "created_at": "2024-12-20 02:41:41.990145",
                "updated_at": toGMT8().toISOString(),
                "deleted_at": toGMT8().toISOString(),
                "max_employees": null,
                "max_department_instances": 1,
                "is_superior": true,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Staff",
                "superior_id": null,
                "is_active": true,
                "created_at": "2024-12-20 05:50:31.752485",
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": null,
                "max_department_instances": 0,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Rank in File",
                "superior_id": null,
                "is_active": true,
                "created_at": "2024-12-25 09:48:48.912000",
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 0,
                "max_department_instances": 0,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Senior Developer",
                "superior_id": null,
                "is_active": true,
                "created_at": "2024-12-27 06:28:38.905000",
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 2,
                "max_department_instances": 1,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Marketing Specialist",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 2,
                "max_department_instances": 2,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Chief Technology Officer",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 3,
                "max_department_instances": 4,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Executive Assistant",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 3,
                "max_department_instances": 5,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Project Manager",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 3,
                "max_department_instances": 2,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Finance manager",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 5,
                "max_department_instances": 3,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Business analyst",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 5,
                "max_department_instances": 3,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Sales representative",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 3,
                "max_department_instances": 3,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Administrative assistant",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 5,
                "max_department_instances": 5,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Human resource personnel",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 3,
                "max_department_instances": 2,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Senior Manager",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 4,
                "max_department_instances": 2,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Immediate Supervisor",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 1,
                "max_department_instances": 1,
                "is_superior": true,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Assistant Vice President",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 1,
                "max_department_instances": 0,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Brand Strategist",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 3,
                "max_department_instances": 2,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Digital Marketing Analyst",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 2,
                "max_department_instances": 1,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Marketing Automation Specialist",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 3,
                "max_department_instances": 2,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Account Manager",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 2,
                "max_department_instances": 2,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Sales Consultant",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 2,
                "max_department_instances": 2,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Executive",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 2,
                "max_department_instances": 1,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Operations and production",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 2,
                "max_department_instances": 1,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "Chief Operating Officer",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 1,
                "max_department_instances": 1,
                "is_superior": true,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }, {
                "name": "HR Clerk",
                "superior_id": null,
                "is_active": true,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "max_employees": 3,
                "max_department_instances": 3,
                "is_superior": false,
                "department_id": null,
                "max_salary": 0,
                "min_salary": 0
            }
                // Add more job classes as needed...
            ],
        });
        console.log('Seeding ref_job_classes completed.');

        // Insert into ref_salary_grades
        console.log('Seeding ref_salary_grades...');
        await tx.ref_salary_grades.createMany({
            data: [{
                "name": "SG9",
                "amount": 22219,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "rate_per_hour": 854.57
            }, {
                "name": "SG8",
                "amount": 20534,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "rate_per_hour": 789
            }, {
                "name": "SG7",
                "amount": 19365,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "rate_per_hour": 744.8
            }, {
                "name": "SG12",
                "amount": 18255,
                "created_at": toGMT8().toISOString(),
                "updated_at": toGMT8().toISOString(),
                "deleted_at": null,
                "rate_per_hour": 702.11
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
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
                signatories_name: 'Overtime',
            }, {
                signatories_path: '/leaves/leave-requests',
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
                signatories_name: 'Leave Request',
            }, // Add more signatory paths as needed...
            ],
        });
        console.log('Seeding ref_signatory_paths completed.');

        // Insert into ref_signatory_roles
        console.log('Seeding ref_signatory_roles...');
        await tx.ref_signatory_roles.createMany({
            data: [{
                signatory_role_name: 'Approver', created_at: toGMT8().toISOString(), updated_at: toGMT8().toISOString(),
            }, {
                signatory_role_name: 'reviewer', created_at: toGMT8().toISOString(), updated_at: toGMT8().toISOString(),
            }, // Add more signatory roles as needed...
            ],
        });
        console.log('Seeding ref_signatory_roles completed.');

        // Insert into sys_notification_types
        console.log('Seeding sys_notification_types...');
        await tx.sys_notification_types.createMany({
            data: [{
                "type_name": "System Alert", "description": "General system-related notifications."
            }, {
                "type_name": "Task Assignment", "description": "Notifications for new tasks assigned."
            }, {
                "type_name": "Reminder", "description": "Notification to remind about deadlines."
            }, {
                "type_name": "Message", "description": "Notifications for new messages."
            }, {
                "type_name": "Announcement", "description": "Organization-wide announcements."
            }, {
                "type_name": "Warning", "description": "Notifications for warnings or issues."
            }, {
                "type_name": "Error", "description": "Notifications for critical errors."
            }, {
                "type_name": "Promotion", "description": "Promotional notifications or offers."
            }
                // Add more notification types as needed...
            ],
        });
        console.log('Seeding sys_notification_types completed.');

        // Insert into trans_users
        console.log('Seeding trans_users...');
        await tx.trans_users.create({
            data: {
                id: '00a29860-665d-4794-88eb-c12d183b76b3',
                name: 'Admin',
                email: 'admin@gmail.com',
                emailVerified: null,
                image: 'https://files.edgestore.dev/6bc0cgi3ynpz46db/publicFiles/_public/7f0e37fb-e9f5-4f09-8047-ce3b33d53904.jpg',
                createdAt: toGMT8().toISOString(),
                updatedAt: toGMT8().toISOString(),
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
                created_at: toGMT8().toISOString(),
                updated_at: null,
                user_id: '00a29860-665d-4794-88eb-c12d183b76b3',
            },
        });
        console.log('Seeding auth_credentials completed.');

        // Insert into acl_user_access_control
        console.log('Seeding acl_user_access_control...');
        await tx.acl_user_access_control.create({
            data: {
                employee_id: 1,
                privilege_id: 19,
                banned_til: null,
                created_at: toGMT8().toISOString(),
                update_at: null,
                user_id: '00a29860-665d-4794-88eb-c12d183b76b3',
            },
        });
        console.log('Seeding acl_user_access_control completed.');

        // Insert into dim_schedules
        console.log('Seeding dim_schedules...');
        await tx.dim_schedules.createMany({
            data: [{
                id: 2,
                employee_id: 1,
                days_json: '["mon","tue","wed","thu","fri","sat"]',
                batch_id: 13,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
                start_date: toGMT8().toISOString(),
                end_date: toGMT8().toISOString(),
                clock_in: '09:00:00',
                clock_out: '18:00:00',
                break_min: 60,
            }, {
                id: 3,
                employee_id: 1,
                days_json: '["mon","tue","wed","thu","fri","sat","sun"]',
                batch_id: 13,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
                start_date: new Date('2025-01-05T09:49:06.006Z'),
                end_date: null,
                clock_in: '09:00:00',
                clock_out: '18:00:00',
                break_min: 60,
            },],
        });
        console.log('Seeding dim_schedules completed.');

        // Insert into ref_batch_schedules
        console.log('Seeding ref_batch_schedules...');
        await tx.ref_batch_schedules.createMany({
            data: [{
                name: 'Opening Batch',
                clock_in: '08:00:00',
                clock_out: '17:00:00',
                is_active: true,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
                break_min: 60,
            }, {
                name: 'Closing Batch',
                clock_in: '09:00:00',
                clock_out: '18:00:00',
                is_active: true,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
                break_min: 60,
            },],
        });
        console.log('Seeding ref_batch_schedules completed.');

        // Insert into trans_signatories
        console.log('Seeding trans_signatories...');
        await tx.trans_signatories.createMany({
            data: [{
                job_id: 12,
                signatory_role_id: 2,
                signatory_path_id: 2,
                order_number: 1,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
                is_apply_to_all_signatory: false,
            }, {
                job_id: 11,
                signatory_role_id: 1,
                signatory_path_id: 2,
                order_number: 2,
                created_at: toGMT8().toISOString(),
                updated_at: toGMT8().toISOString(),
                is_apply_to_all_signatory: true,
            }, // Add more signatories as needed...
            ],
        });
        console.log('Seeding trans_signatories completed.');
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