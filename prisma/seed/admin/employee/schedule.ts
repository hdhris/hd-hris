import {toGMT8} from "../../../../lib/utils/toGMT8";

export async function schedule(prisma: any){
    console.log("Creating Schedule...");
    const scheduleData = [
        {
            "id": 1,
            "name": "Closing Batch",
            "clock_in": toGMT8("09:00:00").toISOString(),
            "clock_out": toGMT8("18:30:00").toISOString(),
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "break_min": 60
        },
        {
            "id": 2,
            "name": "Opening Batch",
            "clock_in": toGMT8("08:00:00").toISOString(),
            "clock_out": toGMT8("17:00:00").toISOString(),
            "is_active": true,
            "created_at": new Date(),
            "updated_at": new Date(),
            "deleted_at": null,
            "break_min": 60
        }
    ]

    await prisma.ref_batch_schedules.createMany({
        data: scheduleData
    })
    console.log("Finished Schedule...");
}