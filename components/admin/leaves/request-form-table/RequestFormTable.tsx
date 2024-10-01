"use client"
import React from 'react';
import {FormTableProvider} from "@/components/providers/FormTableProvider";
import {RequestFormWithMethod} from "@/types/leaves/LeaveRequestTypes";

function RequestFormTable({children}: { children: React.ReactNode }) {
    return (
        <FormTableProvider<RequestFormWithMethod>>
            {children}
        </FormTableProvider>
    );
}

export default RequestFormTable;