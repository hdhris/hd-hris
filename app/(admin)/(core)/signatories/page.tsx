import React from 'react';
import SignatoryForm from "@/components/admin/signaturories/signatory-form";

function Page() {
    return (
        <div className="grid grid-cols-[1fr_auto] gap-4 w-full h-full bg-amber-200">
            <div className="w-full bg-red-500">

            </div>
            <SignatoryForm/>
        </div>
    );
}

export default Page;