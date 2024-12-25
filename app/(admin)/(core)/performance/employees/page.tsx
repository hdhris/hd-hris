"use client";
import UserMail from "@/components/common/avatar/user-info-mail";
import TableData from "@/components/tabledata/TableData";
import { toast } from "@/components/ui/use-toast";
import { MinorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { useEmployeeId } from "@/hooks/employeeIdHook";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { useQuery } from "@/services/queries";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";

function Page() {
    const router = useRouter();
    const { data: employees } = useQuery<MinorEmployee[]>("/api/admin/performance/employees");
    const userID = useEmployeeId();

    async function surveyEmployee(id: React.Key){
        try{
            const result = (await axios.post('/api/admin/performance/employees/file', {
                evaluated_by: userID,
                employee_id: Number(String(id)),
            })).data;
            if(result.status){
                router.push(`/performance/employees/survey?id=${result.id}`)
            } else {
                throw new Error(String(result.message))
            }
        } catch(error){
            toast({
                title: String(error),
                variant: "danger",
            })
        }
    }

    return (
        <div>
            <TableData
                items={employees || []}
                config={config}
                onRowAction={surveyEmployee}
            />
        </div>
    );
}

export default Page;

const config: TableConfigProps<MinorEmployee> = {
    columns: [{ uid: "name", name: "Name", sortable: true }],
    rowCell: (item, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <div>
                        <UserMail name={getEmpFullName(item)} picture={item.picture} email={item.email} />
                    </div>
                );
            default:
                return <></>;
        }
    },
};
