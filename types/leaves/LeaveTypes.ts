import React from "react";
import {LeaveTypesItems} from "@/types/leaves/LeaveRequestTypes";

export interface LeaveTypesKey {
    key: React.Key,
    data?: LeaveTypesItems
}