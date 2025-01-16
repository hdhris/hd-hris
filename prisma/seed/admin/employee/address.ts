import addressData from "../../json/address.json"

export async function address(prisma: any){
    console.log("Creating Address...");
    await prisma.ref_addresses.createMany({
        data: addressData
    });

    console.log("Finished Address...");
}