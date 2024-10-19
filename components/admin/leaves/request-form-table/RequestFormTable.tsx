"use client"
import React from 'react';
import {FormTableProvider} from "@/components/providers/FormTableProvider";
import {RequestFormTableType} from "@/types/leaves/LeaveRequestTypes";

function RequestFormTable({children}: { children: React.ReactNode }) {
    return (
        <FormTableProvider<RequestFormTableType>>
            {children}
        </FormTableProvider>
    );
}

export default RequestFormTable;