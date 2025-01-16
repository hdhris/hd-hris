import {toGMT8} from "../../../../lib/utils/toGMT8";

export async function statutoryPlans(prisma: any){
    console.log("Creating Statutory Plans");
    const statutory_plans =[
        {
            "id": 1,
            "name": "HMO",
            "type": "Health",
            "coverage_details": "Health Maintenance Organizations (HMOs) in the Philippines provide managed healthcare benefits with the following key coverages:\n\nPreventive Care: Annual physical exams, laboratory tests, X-rays, and health screenings. Vaccinations may also be included.\nIn-Patient Care: Hospital room and board, doctors’ fees, medications, and diagnostics during confinement. Limits depend on the plan.\nOut-Patient Care: Consultations, diagnostics, and minor procedures, available through accredited providers.\nEmergency Care: Emergency room consultations, treatments, and ambulance services.\nMaternity Benefits: Prenatal care, normal and cesarean deliveries, and postnatal services. Often available as an add-on.\nDental Care: Teeth cleaning, basic extractions, fillings, and gum treatments (excludes cosmetic procedures).\nMental Health Services: Psychiatric consultations and therapy sessions with limits.\nSpecial Procedures: Dialysis, chemotherapy, radiation, and physical therapy (coverage caps apply).\nPre-Existing Conditions: Often covered after a waiting period, but some exclusions may apply.\nLimitations: Excludes cosmetic treatments, fertility procedures, alternative therapies, and treatments for self-inflicted injuries. Coverage has maximum benefit limits (MBL) ranging from ₱50,000 to ₱500,000 annually, depending on the plan.",
            "effective_date": toGMT8("2024-01-01").toISOString(),
            "expiration_date": toGMT8(toGMT8("2025-12-31").toISOString()).toISOString(),
            "description": "HMOs are a popular benefit for employees, and insurance companies also offer HMO options for self-employed people.",
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "is_active": true,
            "deduction_id": 7
        },
        {
            "id": 2,
            "name": "PhilHealth",
            "type": "Health",
            "coverage_details": "**PhilHealth** (Philippine Health Insurance Corporation) provides health insurance coverage to Filipino citizens, offering financial assistance for medical expenses. The main benefits include **Inpatient Benefits**, which cover hospital confinement, surgeries, and other medical services, as well as **Outpatient Benefits** for services like consultations, laboratory tests, and treatments not requiring hospitalization. **Maternity Benefits** cover delivery-related expenses, including normal and caesarean deliveries. PhilHealth also provides **Z Benefits** for catastrophic conditions like cancer and **Case Rates** for specific procedures and illnesses, ensuring members have a set amount covered. **Primary Care Benefits** are available for preventive care and consultations, while **Dialysis and Cancer Treatment** benefits assist with specialized care. Eligibility for these benefits depends on the member’s contributions and active status, with regular contributions required for full coverage. PhilHealth members can also access benefits through accredited hospitals and clinics, with online services available for easier management of membership and claims.",
            "effective_date": toGMT8("2024-01-01").toISOString(),
            "expiration_date": toGMT8(toGMT8("2025-12-31").toISOString()).toISOString(),
            "description": "is a government-owned and controlled corporation (GOCC) that provides health insurance to all Filipinos. ",
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "is_active": true,
            "deduction_id": 11
        },
        {
            "id": 3,
            "name": "Pag-Ibig",
            "type": "Social",
            "coverage_details": "The **Pag-IBIG Fund** (Home Development Mutual Fund) in the Philippines provides various benefits aimed at helping members save for the future and access financial assistance for housing. These benefits include **Housing Loans**, which provide financing for the purchase, construction, or renovation of homes; **Short-Term Loans** like the **Multipurpose Loan**, which offers cash assistance for emergencies, and the **Calamity Loan**, which is available for members affected by natural disasters. The Pag-IBIG Fund also offers **Savings Programs**, such as the regular **Pag-IBIG I Savings** and the **Pag-IBIG II Savings**, where members can invest and earn dividends. Additionally, members who have contributed regularly are eligible for the **Member’s Savings** benefit, which helps in building their retirement fund. These benefits are available to active members who meet the required contribution criteria, and the Pag-IBIG Fund provides an easy process for application and claims, often through online services for convenience.",
            "effective_date": toGMT8("2024-01-01").toISOString(),
            "expiration_date": toGMT8(toGMT8("2025-12-31").toISOString()).toISOString(),
            "description": "The amount a member can borrow is also affected by any outstanding Pag-IBIG Calamity Loan. If a member has a calamity loan, the amount they can borrow is the difference between 80% of their total Pag-IBIG Regular Savings and the outstanding balance of their calamity loan.",
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "is_active": true,
            "deduction_id": 10
        },
        {
            "id": 4,
            "name": "SSS 2024",
            "type": "Social",
            "coverage_details": "The **Social Security System (SSS)** in the Philippines offers various benefits to its members, including sickness, maternity, disability, death, retirement, funeral, and loan benefits. Sickness benefits provide cash allowances for members unable to work due to illness, while maternity benefits support female members during childbirth or miscarriage. Disability benefits offer monthly cash assistance to those permanently disabled, and death benefits provide a lump sum or pension to the beneficiaries of deceased members. Retirement benefits are available to members who reach retirement age (60-65) and have contributed for at least 120 months, offering either a monthly pension or a lump sum. Funeral benefits cover funeral expenses, while salary loans and calamity loans provide financial assistance to active members based on their contributions, with repayment plans. Pensioners aged 65 and above can access the SSS pension loan if they have received at least one pension payment. Eligibility for these benefits depends on the member’s contribution history, and claims require the necessary documents, with services available online for convenience.",
            "effective_date": toGMT8("2024-01-01").toISOString(),
            "expiration_date": toGMT8("2024-12-31").toISOString(),
            "description": "a government-run social insurance program in the Philippines that provides financial support to private sector workers",
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "is_active": true,
            "deduction_id": 4
        },
        {
            "id": 5,
            "name": "SSS 2025",
            "type": "Social",
            "coverage_details": "The **Social Security System (SSS)** in the Philippines offers various benefits to its members, including sickness, maternity, disability, death, retirement, funeral, and loan benefits. Sickness benefits provide cash allowances for members unable to work due to illness, while maternity benefits support female members during childbirth or miscarriage. Disability benefits offer monthly cash assistance to those permanently disabled, and death benefits provide a lump sum or pension to the beneficiaries of deceased members. Retirement benefits are available to members who reach retirement age (60-65) and have contributed for at least 120 months, offering either a monthly pension or a lump sum. Funeral benefits cover funeral expenses, while salary loans and calamity loans provide financial assistance to active members based on their contributions, with repayment plans. Pensioners aged 65 and above can access the SSS pension loan if they have received at least one pension payment. Eligibility for these benefits depends on the member’s contribution history, and claims require the necessary documents, with services available online for convenience.",
            "effective_date": toGMT8("2024-01-01").toISOString(),
            "expiration_date": toGMT8("2025-12-31").toISOString(),
            "description": "a government-run social insurance program in the Philippines that provides financial support to private sector workers",
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "is_active": true,
            "deduction_id": 5
        }
    ]

    await prisma.ref_benefit_plans.createMany({
        data: statutory_plans
    })
    console.log("Creating Statutory Plans");
}