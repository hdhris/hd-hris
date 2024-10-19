import React from 'react';
import Typography from "@/components/common/typography/Typography";
import {LuCheck, LuX} from "react-icons/lu";

interface BodyProps {
    employee_count: number;
    duration_range: string;
    code: string;
    carry_over: boolean;
}

function Body({employee_count, duration_range, code, carry_over}: BodyProps) {
    return (<div className="grid gap-2">
            <div className="flex justify-between">
                <Typography className="font-medium text-medium">Employees No:</Typography>
                <Typography className="font-semibold text-medium ">{employee_count}</Typography>
            </div>
            <div className="flex justify-between">
                <Typography className="font-medium text-medium">Duration Range:</Typography>
                <Typography className="font-semibold text-medium ">{duration_range} Day/s</Typography>
            </div>
            <div className="flex justify-between">
                <Typography className="font-medium text-medium">Code:</Typography>
                <Typography className="font-semibold text-medium">{code}</Typography>
            </div>
            <div className="flex justify-between items-center">
                <Typography className="font-medium text-medium">Carry Over:</Typography>
                {carry_over ? (<LuCheck className="h-5 w-5 text-success-500"/>) : (
                    <LuX className="h-5 w-5 text-danger-500"/>)}
            </div>
        </div>);
}

export default Body;