"use client"
import React from 'react';
import {FormTableProvider} from "@/components/providers/FormTableProvider";
import {LeaveTypeForm, RequestFormWithMethod} from "@/types/leaves/LeaveRequestTypes";

function LeaveTypeProvider({children}: { children: React.ReactNode }) {
    return (
        <FormTableProvider<LeaveTypeForm>>
            {children}
        </FormTableProvider>
    );
}

export default LeaveTypeProvider;