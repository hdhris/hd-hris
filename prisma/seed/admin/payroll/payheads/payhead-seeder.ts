import { toGMT8 } from "@/lib/utils/toGMT8";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const basic_salary = {
    id: 1,
    name: "Basic Salary",
    calculation: "basic_salary",
    type: "earning",
    is_active: true,
    is_overwritable: false,
    system_only: true,
    affected_json: { mandatory: "all", departments: "all", job_classes: "all", employees: "all" },
    created_at: toGMT8().toISOString(),
    updated_at: toGMT8().toISOString(),
};
const cash_disbursement = {
    id: 2,
    name: "Cash Disbursement",
    calculation: "get_disbursement",
    type: "earning",
    is_active: true,
    is_overwritable: true,
    system_only: true,
    affected_json: { mandatory: "all", departments: "all", job_classes: "all", employees: "all" },
    created_at: toGMT8().toISOString(),
    updated_at: toGMT8().toISOString(),
};
const cash_repayment = {
    id: 3,
    name: "Cash Repayment",
    calculation: "get_repayment",
    type: "deduction",
    is_active: true,
    is_overwritable: true,
    system_only: true,
    affected_json: { mandatory: "all", departments: "all", job_classes: "all", employees: "all" },
    created_at: toGMT8().toISOString(),
    updated_at: toGMT8().toISOString(),
};

async function main() {
    const payheads =  await Promise.all([
        prisma.ref_payheads.upsert({
            where: { id: 1 },
            create: basic_salary,
            update: basic_salary,
        }),
        prisma.ref_payheads.upsert({
            where: { id: 2 },
            create: cash_disbursement,
            update: cash_disbursement,
        }),
        prisma.ref_payheads.upsert({
            where: { id: 3 },
            create: cash_repayment,
            update: cash_repayment,
        })
    ])
    console.log({ payheads });
}
main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
