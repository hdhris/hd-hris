import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedLeaveTypes(prisma: any) {
    console.log('Seeding Leave Types...');

    const leave_types = [
            {
                "code": "SIL",
                "description": "Employees who have rendered at least one year of service are entitled to five days of paid leave annually. This leave can be used for vacation or sick leave purposes.",
                "is_active": true,
                "max_duration": 5,
                "name": "Service Incentive Leave (SIL)",
                "paid_leave": true,
                "carry_over": true,
                "attachment_required": false,
                "is_applicable_to_all": true,
                "created_at": new Date(),
                "updated_at": new Date()
            },
            {
                "code": "ML",
                "description": "Female employees are entitled to 105 days of paid maternity leave for normal and caesarean deliveries. An additional 15 days are granted if the mother is a solo parent.",
                "is_active": true,
                "max_duration": 105,
                "name": "Maternity Leave",
                "paid_leave": true,
                "carry_over": false,
                "attachment_required": true,
                "is_applicable_to_all": false,
                "created_at": new Date(),
                "updated_at": new Date()
            },
            {
                "code": "PL",
                "description": "Married male employees are entitled to seven working days of paid leave upon the delivery of their legitimate spouse.",
                "is_active": true,
                "max_duration": 7,
                "name": "Paternity Leave",
                "paid_leave": true,
                "carry_over": false,
                "attachment_required": true,
                "is_applicable_to_all": false,
                "created_at": new Date(),
                "updated_at": new Date()
            },
            {
                "code": "PLSP",
                "description": "Solo parents are entitled to seven working days of paid leave annually to assist in child-rearing responsibilities.",
                "is_active": true,
                "max_duration": 7,
                "name": "Parental Leave for Solo Parents",
                "paid_leave": true,
                "carry_over": false,
                "attachment_required": true,
                "is_applicable_to_all": false,
                "created_at": new Date(),
                "updated_at": new Date()
            },
            {
                "code": "SLW",
                "description": "Female employees are entitled to up to two months of paid leave following surgery due to gynecological disorders.",
                "is_active": true,
                "max_duration": 2,
                "name": "Special Leave for Women",
                "paid_leave": true,
                "carry_over": false,
                "attachment_required": true,
                "is_applicable_to_all": false,
                "created_at": new Date(),
                "updated_at": new Date()
            },
            {
                "code": "VAWC",
                "description": "Female employees who are victims of violence are entitled to up to ten days of paid leave to address issues related to violence.",
                "is_active": true,
                "max_duration": 10,
                "name": "Leave for Victims of Violence Against Women and Their Children",
                "paid_leave": true,
                "carry_over": false,
                "attachment_required": true,
                "is_applicable_to_all": false,
                "created_at": new Date(),
                "updated_at": new Date()
            },
            {
                "code": "BL",
                "description": "While not mandated by law, many companies provide paid leave to employees who have experienced the death of an immediate family member.",
                "is_active": true,
                "max_duration": 5,
                "name": "Bereavement Leave",
                "paid_leave": true,
                "carry_over": false,
                "attachment_required": true,
                "is_applicable_to_all": false,
                "created_at": new Date(),
                "updated_at": new Date()
            },
            {
                "code": "SL",
                "description": "Employers are not required by law to provide paid sick leave. However, the Service Incentive Leave (SIL) can be used for this purpose.",
                "is_active": true,
                "max_duration": 10,
                "name": "Sick Leave",
                "paid_leave": true,
                "carry_over": true,
                "attachment_required": false,
                "is_applicable_to_all": true,
                "created_at": new Date(),
                "updated_at": new Date()
            },
            {
                "code": "VL",
                "description": "Not mandated by law. Employers may provide vacation leave at their discretion.",
                "is_active": true,
                "max_duration": 10,
                "name": "Vacation Leave",
                "paid_leave": true,
                "carry_over": true,
                "attachment_required": false,
                "is_applicable_to_all": false,
                "created_at": new Date(),
                "updated_at": new Date()
            },
            {
                "code": "PH",
                "description": "Employees are entitled to paid leave on public holidays. If required to work, they are entitled to additional compensation.",
                "is_active": true,
                "max_duration": 10,
                "name": "Public Holidays",
                "paid_leave": true,
                "carry_over": false,
                "attachment_required": false,
                "is_applicable_to_all": true,
                "created_at": new Date(),
                "updated_at": new Date()
            }
        ]

    // Use Promise.all with map for concurrent writes
    await Promise.all(
        leave_types.map((lt) =>
            prisma.ref_leave_type_details.create({
                data: {...lt},
            })
        )
    );

    console.log('Seeding Leave Types completed successfully.');
}
//
// // Run the function if executed directly
// if (require.main === module) {
//     seedJobClasses()
//         .catch((e) => {
//             console.error('Error while seeding ref_job_classes:', e);
//             process.exit(1);
//         })
//         .finally(async () => {
//             await prisma.$disconnect();
//         });
// }
