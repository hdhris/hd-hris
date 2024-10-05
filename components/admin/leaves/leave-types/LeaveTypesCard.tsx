"use client";

import React, {useState} from 'react';
import GridCard from "@/components/common/cards/GridCard";
import Typography from "@/components/common/typography/Typography";
import {LuCheck, LuX} from "react-icons/lu";
import {cn} from "@nextui-org/react";
import ActionControlDropdown from "@/components/common/action-controls/ActionControlDropdown";
import Pulse from "@/components/common/effects/Pulse";
import uniqolor from "uniqolor";
import {Key} from "@react-types/shared";
import {LeaveTypesItems} from "@/types/leaves/LeaveRequestTypes";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";
import showDialog from "@/lib/utils/confirmDialog";



interface LeaveCard {
    data: LeaveTypesItems[];
}
const bgGradient = (name: string) => {
    return {
        style: {
            background: uniqolor(name).color
        }
    }
}



 function LeaveTypesCard({ data }: LeaveCard) {
    const {toast} =useToast()
    const [leaveTypes, setLeaveTypes] = useState<LeaveTypesItems[]>(data)

     const handleDelete = async (key: React.Key) => {
         // Find the item to delete and store it in case we need to restore it
         const deleteItem = leaveTypes.find(item => item.key === key);

         if (!deleteItem) return; // Exit if the item is not found


         try {
             // Confirm deletion with a dialog
             const result = await showDialog(
                 "Confirm Delete",
                 `Are you sure you want to delete ${deleteItem.name}?`,
                 false
             );

             // Remove the item from the state immediately
             setLeaveTypes(prev => prev.filter(item => item.key !== key));
             if (result === "yes") {
                 // Send the delete request to the API
                 const x  = await axiosInstance.post(
                     "/api/admin/leaves/leave-types/delete", Number(key)  // Ensure you pass the key properly
                 );


                 toast({
                     title: "Deleted",
                     description: "Schedule deleted successfully!",
                     variant: "success",
                 });
             } else {
                 // If the user cancels, restore the item back to the list
                 setLeaveTypes(prev => [...prev, deleteItem]);
             }
         } catch (error: any) {
             // If an error occurs, show an error toast and restore the deleted item
             toast({
                 title: "Error",
                 description: "Error: " + error.message,
                 variant: "danger",
             });

             // Restore the item back to the list
             setLeaveTypes(prev => [...prev, deleteItem]);
         }
     };


     const handleEdit = (key: Key) => {
        alert("Edited: " + key);
    }
    return (
        <GridCard
            data={leaveTypes.sort((a, b) => a.name.localeCompare(b.name))}
            header={({key, name, is_active}) => {
                const isLight = uniqolor(name).isLight;
                return (
                    <div {...bgGradient(name)}
                         className={cn("relative flex w-full h-28 rounded-b-sm rounded-r-sm", !isLight ? "shadow-[inset_-1px_-121px_75px_-52px_rgba(0,0,0,0.49)]" : "shadow-[inset_-1px_-121px_75px_-52px_rgba(255,255,255,0.49)]")}> {/* shadow-[inset_-1px_-121px_75px_-52px_rgba(0,0,0,0.49)] */}
                        {/* Name positioned bottom-left */}
                        <div className="absolute top-2 right-0 pr-2">
                            <ActionControlDropdown
                                className={isLight ? "text-black" : "text-white"}
                                onDelete={handleDelete.bind(null, key as Key)}
                                onEdit={handleEdit.bind(null, key as Key)}
                            />
                        </div>

                        <div className="flex items-end p-2 gap-4 w-full h-full">
                            <Pulse color={is_active ? "success" : "danger"}/>
                            <Typography
                                className={cn("w-full text-2xl font-extrabold break-words overflow-hidden text-pretty", isLight ? "text-black" : "text-white")}>
                                {name}
                            </Typography>
                        </div>
                    </div>
                )
            }}
            body={({duration_days, code, is_carry_forward}) => {
                return (
                    <div className="grid gap-2">
                        <div className="flex justify-between">
                            <Typography className="font-medium text-medium">Duration:</Typography>
                            <Typography className="font-semibold text-medium ">{duration_days}</Typography>
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
                    </div>)
            }}/>
    );
}

export default LeaveTypesCard;
