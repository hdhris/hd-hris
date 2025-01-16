export async function leaveTypes(prisma: any){
    console.log("Creating Leave Types...");

    const signatory_roles = [
        {
            "id": 1,
            "code": "SIL",
            "description": "Employees who have rendered at least one year of service are entitled to five days of paid leave annually. This leave can be used for vacation or sick leave purposes.",
            "is_active": true,
            "max_duration": 5.00,
            "name": "Service Incentive Leave (SIL)",
            "paid_leave": true,
            "carry_over": true,
            "attachment_required": false,
            "created_at": new Date(),
            "updated_at": new Date()
        },
        {
            "id": 2,
            "code": "ML",
            "description": "Female employees are entitled to 105 days of paid maternity leave for normal and caesarean deliveries. An additional 15 days are granted if the mother is a solo parent.",
            "is_active": true,
            "max_duration": 105.00,
            "name": "Maternity Leave",
            "paid_leave": true,
            "carry_over": false,
            "attachment_required": true,
            "created_at": new Date(),
            "updated_at": new Date()
        },
        {
            "id": 3,
            "code": "PL",
            "description": "Married male employees are entitled to seven working days of paid leave upon the delivery of their legitimate spouse.",
            "is_active": true,
            "max_duration": 7.00,
            "name": "Paternity Leave",
            "paid_leave": true,
            "carry_over": false,
            "attachment_required": true,
            "created_at": new Date(),
            "updated_at": new Date()
        },
        {
            "id": 4,
            "code": "SL",
            "description": "Employers are not required by law to provide paid sick leave. However, the Service Incentive Leave (SIL) can be used for this purpose.",
            "is_active": true,
            "max_duration": 10.00,
            "name": "Sick Leave",
            "paid_leave": true,
            "carry_over": true,
            "attachment_required": false,
            "created_at": new Date(),
            "updated_at": new Date()
        },
        {
            "id": 5,
            "code": "VL",
            "description": "Not mandated by law. Employers may provide vacation leave at their discretion.",
            "is_active": true,
            "max_duration": 10.00,
            "name": "Vacation Leave",
            "paid_leave": true,
            "carry_over": true,
            "attachment_required": false,
            "created_at": new Date(),
            "updated_at": new Date()
        },
        {
            "id": 6,
            "code": "BL",
            "description": "While not mandated by law, many companies provide paid leave to employees who have experienced the death of an immediate family member.",
            "is_active": true,
            "max_duration": 5.00,
            "name": "Bereavement Leave",
            "paid_leave": true,
            "carry_over": false,
            "attachment_required": true,
            "created_at": new Date(),
            "updated_at": new Date()
        }
    ]

    await prisma.ref_leave_type_details.createMany({
        data: signatory_roles
    })

    console.log("Finished Leave Types...");

}