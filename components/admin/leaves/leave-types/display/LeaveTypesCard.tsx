"use client";
import React, {useEffect, useState} from 'react';
import GridCard from "@/components/common/cards/GridCard";
import {LeaveTypesItems} from "@/types/leaves/LeaveRequestTypes";
import {useLeaveTypes} from "@/services/queries";
import Loading from "@/components/spinner/Loading";
import Header from "@/components/admin/leaves/leave-types/display/action-control/Header";
import Body from "@/components/admin/leaves/leave-types/display/action-control/Body";
import {useFormTable} from "@/components/providers/FormTableProvider";
import {LeaveTypesKey} from "@/types/leaves/LeaveTypes";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {SetNavEndContent} from "@/components/common/tabs/NavigationTabs";
import LeaveTypeForm from "@/components/admin/leaves/leave-types/form/LeaveTypeForm";
import NoData from "@/components/common/no-data/NoData";
import {axiosInstance} from "@/services/fetcher";
import {useToast} from "@/components/ui/use-toast";

function LeaveTypesCard() {

    const {toast} = useToast()
    const {data, isLoading, error} = useLeaveTypes()
    const {formData} = useFormTable<LeaveTypesKey>()
    const [leaveTypes, setLeaveTypes] = useState<LeaveTypesItems[]>([])
    useEffect(() => {
        if (data && !isLoading) {
            const leaves_types = data.map((item) => {
                return {
                    key: item.key,
                    employee_count: item.employee_count,
                    name: item.name,
                    code: item.code || "N/A",
                    carry_over: item.carry_over,
                    is_active: item.is_active!,
                    min_duration: item.min_duration,
                    max_duration: item.max_duration
                }
            })
            setLeaveTypes(leaves_types)
        }
    }, [data, isLoading])

    useEffect(() => {
        const handleFormData = async () => {
            if (formData?.method === "Delete") {
                const key = formData?.data?.key;
                const deletedItem = leaveTypes.find(item => item.key === key); // Ensure you find the correct item based on the key

                if (deletedItem) {
                    // Update state to remove the item optimistically
                    setLeaveTypes((prev) => prev.filter((item) => item.key !== deletedItem.key));
                    try {
                        // Send delete request
                        const res =await axiosInstance.post("/api/admin/leaves/leave-types/delete", key);
                        if(res.status === 200){
                            toast({
                                title: "Delete",
                                description: "Leave type deleted successfully",
                                variant: "success"
                            })
                        }
                    } catch (error) {
                        // If delete fails, restore the deleted item
                        setLeaveTypes((prevState) => [...prevState, deletedItem]);
                        console.error("Delete failed:", error); // Log the error for debugging
                        toast({
                            title: "Delete Failed",
                            description: "Failed to delete the leave type. Please try again.",
                            variant: "danger"
                        });
                    }
                }
            } else if (formData?.method === "Edit") {
                // Handle the edit logic here
                // Example: const updatedItem = { ... };
                // setLeaveTypes((prev) => prev.map(item => item.key === updatedItem.key ? updatedItem : item));
            }
        };

        handleFormData();
    }, [formData, leaveTypes]); // Ensure leaveTypes is included in the dependency array


    // SetNavEndContent(() => (<LeaveTypeForm/>));
    if (isLoading) return <Loading/>
    if (!data && !isLoading || error) return <NoData/>
    // Effect for setting nav end content
    return (<>
        <ScrollShadow className="w-full h-full p-5 overflow-auto">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] place-items-center gap-5">
                <GridCard
                    data={leaveTypes?.sort((a, b) => a.name.localeCompare(b.name))}
                    header={({key, name, is_active}) => (
                        <Header id={key}
                                name={name}
                                is_active={is_active}/>)}
                    body={({employee_count, min_duration, max_duration, code, carry_over}) => (
                        <Body employee_count={employee_count}
                              duration_range={`${min_duration} - ${max_duration}`}
                              code={code}
                              carry_over={carry_over}/>)}
                />
            </div>
        </ScrollShadow>
    </>);
}

export default LeaveTypesCard;
