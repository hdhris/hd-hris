
export async function GET() {
    const signatories = await prisma.trans_signatories.findMany({
        where: {
            deleted_at: null
        },
        include: {
            ref_signatory_paths: {
                select:{
                    id: true,
                    signatories_path: true,
                }
            },
            ref_signatory_roles: {
                select: {
                    id: true,
                    signatory_role_name: true
                }
            },
            trans_employees: {
                select: {
                    id: true,
                    prefix: true,
                    first_name: true,
                    middle_name: true,
                    last_name: true,
                    suffix: true,
                    extension: true,
                    ref_departments: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    ref_job_classes: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    })

    return NextResponse.json(signatories)
}