export async function payheads(prisma: any) {
    console.log("Creating Payheads...");

    const payheads_data = [{
        "id": 1,
        "calculation": "get_disbursement",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "Cash Disbursement",
        "type": "earning",
        "affected_json": {"mandatory": "all", "departments": "all", "job_classes": "all", "employees": "all"},
        "variable": null,
        "is_overwritable": true,
        "system_only": true
    }, {
        "id": 2,
        "calculation": "get_repayment",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "Cash Repayment",
        "type": "deduction",
        "affected_json": {"mandatory": "all", "departments": "all", "job_classes": "all", "employees": "all"},
        "variable": null,
        "is_overwritable": true,
        "system_only": true
    }, {
        "id": 3,
        "calculation": "get_tardiness",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "Tardiness and Absences",
        "type": "deduction",
        "affected_json": {"employees": "all", "mandatory": "all", "departments": "all", "job_classes": "all"},
        "variable": null,
        "is_overwritable": false,
        "system_only": true
    }, {
        "id": 4,
        "calculation": "get_contribution",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "SSS 2024",
        "type": "deduction",
        "affected_json": {"employees": "all", "mandatory": "all", "departments": "all", "job_classes": "all"},
        "variable": null,
        "is_overwritable": false,
        "system_only": true
    }, {
        "id": 5,
        "calculation": "get_contribution",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "SSS 2025",
        "type": "deduction",
        "affected_json": {"mandatory": "all", "departments": "all", "job_classes": "all", "employees": "all"},
        "variable": null,
        "is_overwritable": false,
        "system_only": true
    }, {
        "id": 6,
        "calculation": "get_contribution",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "test 1234",
        "type": "deduction",
        "affected_json": {"mandatory": "all", "departments": "all", "job_classes": "all", "employees": "all"},
        "variable": null,
        "is_overwritable": false,
        "system_only": true
    }, {
        "id": 7,
        "calculation": "get_contribution",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "HMO",
        "type": "deduction",
        "affected_json": {"mandatory": "all", "departments": "all", "job_classes": "all", "employees": "all"},
        "variable": null,
        "is_overwritable": false,
        "system_only": true
    }, {
        "id": 8,
        "calculation": "get_leaves",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "Paid Leaves",
        "type": "earning",
        "affected_json": {"employees": "all", "mandatory": "all", "departments": "all", "job_classes": "all"},
        "variable": null,
        "is_overwritable": false,
        "system_only": true
    }, {
        "id": 9,
        "calculation": "get_overtimes",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "Paid Overtimes",
        "type": "earning",
        "affected_json": {"employees": "all", "mandatory": "all", "departments": "all", "job_classes": "all"},
        "variable": null,
        "is_overwritable": false,
        "system_only": true
    }, {
        "id": 10,
        "calculation": "get_contribution",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "Pag-Ibig",
        "type": "deduction",
        "affected_json": {"employees": "all", "mandatory": "all", "departments": "all", "job_classes": "all"},
        "variable": null,
        "is_overwritable": false,
        "system_only": true
    }, {
        "id": 11,
        "calculation": "get_contribution",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "PhilHealth",
        "type": "deduction",
        "affected_json": {"employees": "all", "mandatory": "all", "departments": "all", "job_classes": "all"},
        "variable": null,
        "is_overwritable": false,
        "system_only": true
    }, {
        "id": 12,
        "calculation": "get_basic_salary",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "Basic Salary",
        "type": "earning",
        "affected_json": {"mandatory": "all", "departments": "all", "job_classes": "all", "employees": "all"},
        "variable": "",
        "is_overwritable": false,
        "system_only": true
    }, {
        "id": 13,
        "calculation": "get_incident",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": true,
        "name": "Incident Payable",
        "type": "deduction",
        "affected_json": {"mandatory": "all", "departments": "all", "job_classes": "all", "employees": "all"},
        "variable": null,
        "is_overwritable": true,
        "system_only": true
    }, {
        "id": 14,
        "calculation": "get_unhired",
        "created_at": new Date(),
        "updated_at": new Date(),
        "deleted_at": null,
        "is_active": false,
        "name": "Unhired",
        "type": "deduction",
        "affected_json": {"employees": "all", "mandatory": "all", "departments": "all", "job_classes": "all"},
        "variable": null,
        "is_overwritable": false,
        "system_only": true
    }]

    await prisma.ref_payheads.createMany({
        data: payheads_data
    })

    console.log("Finished Payheads...");

}