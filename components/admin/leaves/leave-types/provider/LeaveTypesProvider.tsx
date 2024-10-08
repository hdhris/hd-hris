"use client"
import React from 'react';
import {FormTableProvider} from "@/components/providers/FormTableProvider";
import {LeaveTypesKey} from "@/types/leaves/LeaveTypes";


function LeaveTypesProvider({children}: { children: React.ReactNode }) {
    return (
        <FormTableProvider<LeaveTypesKey>>
            {children}
        </FormTableProvider>
    );
}

export default LeaveTypesProvider;