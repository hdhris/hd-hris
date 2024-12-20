import { toGMT8 } from "../../../../../lib/utils/toGMT8";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Payheads Data
const payheadsData = [
    {
        id: 1,
        name: "Basic Salary",
        calculation: "basic_salary",
        type: "earning",
        is_active: true,
        is_overwritable: false,
        system_only: true,
        affected_json: { mandatory: "all", departments: "all", job_classes: "all", employees: "all" },
    },
    {
        id: 2,
        name: "Cash Disbursement",
        calculation: "get_disbursement",
        type: "earning",
        is_active: true,
        is_overwritable: true,
        system_only: true,
        affected_json: { mandatory: "all", departments: "all", job_classes: "all", employees: "all" },
    },
    {
        id: 3,
        name: "Cash Repayment",
        calculation: "get_repayment",
        type: "deduction",
        is_active: true,
        is_overwritable: true,
        system_only: true,
        affected_json: { mandatory: "all", departments: "all", job_classes: "all", employees: "all" },
    },
];

export async function seedPayheads(prisma: any) {
    console.log("Seeding Payhead...");

    // Upsert all payheads concurrently
    const payheads = await Promise.all(
        payheadsData.map((payhead) => {
            const timestamp = toGMT8().toISOString();
            return prisma.ref_payheads.upsert({
                where: { id: payhead.id },
                create: { ...payhead, created_at: timestamp, updated_at: timestamp },
                update: { ...payhead, updated_at: timestamp },
            });
        })
    );

    console.log("Seeding Payhead completed successfully:", payheads);
}

// Execute the function
// seedPayheads()
//     .then(async () => {
//         await prisma.$disconnect();
//     })
//     .catch(async (e) => {
//         console.error("Error seeding ref_payheads:", e);
//         await prisma.$disconnect();
//         process.exit(1);
//     });
