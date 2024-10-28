import React from 'react';
import RequestFormTable from "@/components/admin/leaves/request-form-table/RequestFormTable";
import RequestCard from "@/components/admin/leaves/request-form/RequestCard";
import RequestForm from "@/components/admin/leaves/request-form/RequestForm";

async function Page() {

    return (<div className="h-full">
        <RequestFormTable>
            <div className="grid grid-cols-[auto_2fr] gap-4 h-full">
                <RequestForm/>
                <RequestCard/>
            </div>
        </RequestFormTable>
    </div>);
}

export default Page;