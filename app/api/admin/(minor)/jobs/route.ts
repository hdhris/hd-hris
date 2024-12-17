import prisma from "@/prisma/prisma"
export async function GET(){
    try {
       const jobs = await prisma.ref_job_classes.findMany({
           where: {
               deleted_at: null
           },
           select:{
               
           }
       })
    } catch (error){

    }
}