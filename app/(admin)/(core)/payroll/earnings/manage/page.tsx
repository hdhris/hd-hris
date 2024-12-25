import PayheadUpsert from "@/components/admin/payroll/PayheadUpsert";
import { awaitSearchParams } from "@/helper/params/searchParam";
import React from "react";

async function ManagePayhead({ searchParams }: { searchParams: awaitSearchParams }) {
    const payheadID = (await searchParams).id;
    // const payheadType = (await searchParams).type;
    return (
        <div className="flex w-full h-full">
            <PayheadUpsert
                payhead_id={payheadID as string}
                payhead_type="earning" //payhead_type={payheadType as string}
            />
            {/* <h1>{payheadType}</h1> */}
        </div>
    );
}

export default ManagePayhead;
