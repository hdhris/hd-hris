import React from 'react';
import RequestForm from "@/components/admin/leaves/request-form/RequestForm";
import RequestCard from "@/components/admin/leaves/request-form/RequestCard";
import LeaveTypesForm from "@/components/admin/leaves/leave-types/LeaveTypesForm";

function Page() {
    return (
        <div className="grid grid-cols-[auto_2fr] gap-4 h-full">
            <LeaveTypesForm/>
        </div>
    );
}

export default Page;