import React from 'react';
import Typography from "@/components/common/typography/Typography";
import {LuCheck, LuX} from "react-icons/lu";

interface BodyProps {
    employee_count: number;
    duration_days: number;
    code: string;
    is_carry_forward: boolean;
}

function Body({employee_count, duration_days, code, is_carry_forward}: BodyProps) {
    return (<div className="grid gap-2">
            <div className="flex justify-between">
                <Typography className="font-medium text-medium">Employees No:</Typography>
                <Typography className="font-semibold text-medium ">{employee_count}</Typography>
            </div>
            <div className="flex justify-between">
                <Typography className="font-medium text-medium">Duration:</Typography>
                <Typography className="font-semibold text-medium ">{duration_days} Day/s</Typography>
            </div>
            <div className="flex justify-between">
                <Typography className="font-medium text-medium">Code:</Typography>
                <Typography className="font-semibold text-medium">{code}</Typography>
            </div>
            <div className="flex justify-between items-center">
                <Typography className="font-medium text-medium">Carry Forward:</Typography>
                {is_carry_forward ? (<LuCheck className="h-5 w-5 text-success-500"/>) : (
                    <LuX className="h-5 w-5 text-danger-500"/>)}
            </div>
        </div>);
}

export default Body;