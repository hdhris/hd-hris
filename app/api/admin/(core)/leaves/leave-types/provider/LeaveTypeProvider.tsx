import React from 'react';
import {FormTableProvider} from "@/components/providers/FormTableProvider";
import {LeaveTypesItems} from "@/types/leaves/LeaveRequestTypes";


interface LeaveTypeProviderType {
    children: React.ReactNode
}
function LeaveTypeProvider({children}: LeaveTypeProviderType) {
    return (
        <FormTableProvider<LeaveTypesItems>>
            {children}
        </FormTableProvider>
    );
}

export default LeaveTypeProvider;