"use client"

import React from 'react';
import {FormInputProps} from "@/components/common/forms/FormFields";
import BorderCard from "@/components/common/BorderCard";

function LeaveTypesForm() {


    const leaveTypeForm: FormInputProps[] = [
        {label: 'Name', name: 'name', type: 'text', isRequired: true},
        {label: "Code", name: "code", type: "text", isRequired: true},
        {label: "Duration Days", name: "duration_days", type: "number", isRequired: true},
        {label: "Is Active", name: "is_active", type: "checkbox", isRequired: true},
        {label: "Is Carry Forward", name: "is_carry_forward", type: "checkbox", isRequired: true},

    ]

    return (
       <BorderCard heading="Leave Types">
         <div></div>
       </BorderCard>
    );
}

export default LeaveTypesForm;