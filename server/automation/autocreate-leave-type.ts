import prisma from "@/prisma/prisma"
import {sendEmail} from "@/services/email-services";
import {auth} from "@/auth";

const automatingAddingLeaveType = async (id: string | number)=> {
    const session = await auth()
    const is_applicable_to_all = await prisma.ref_leave_type_details.findMany({
        where: {
            trans_leave_types:{
                some:{
                    deleted_at: null
                }
            }
        },
        select: {
            id: true,
            is_applicable_to_all: true
        }
    })

    is_applicable_to_all.forEach(item => {
        if(item.is_applicable_to_all){

            //TODO: this is for testing
            sendEmail({
                to: "xerojohn@gmail.com",
                subject: "Attention Needed",
                html: ``
            })


            // should notify to add


            // await prisma.trans_leave_types.create({
            //     data: {
            //
            //     }
            // })
        }
    })
}
