"use client"
import UserMail from "@/components/common/avatar/user-info-mail";
import TableData from "@/components/tabledata/TableData";
import { MinorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { useQuery } from "@/services/queries";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { useRouter } from "next/navigation";
import React from "react";

function Page() {
    const router = useRouter();
    const { data: employees } = useQuery<MinorEmployee[]>('/api/admin/performance/employees')
    return <div>
        <TableData
            items={employees || []}
            config={config}
            onRowAction={()=> router.push('/performance/employees/survey')}
        />
    </div>;
}

export default Page;


const config: TableConfigProps<MinorEmployee> = {
    columns: [
        { uid: "name", name: "Name", sortable: true },
        // { uid: "desc", name: "Description" },
        // { uid: "type", name: "Type" },
        // { uid: "status", name: "Status" },
    ],
    rowCell: (item, columnKey) => {
        switch (columnKey) {
            case "name":
                return <div>
                    <UserMail
                        name={getEmpFullName(item)}
                        picture={item.picture}
                        email={item.email}
                    />
                </div>;
            // case "desc":
            //     return <p>{item.description}</p>;
            // case "type":
            //     return (
            //         <Chip color="primary" size="sm" variant="faded">
            //             {toUpper(item.ratings_json.type.replaceAll("-", " "))}
            //         </Chip>
            //     );
            // case "status":
            //     return (
            //         <Chip color={item.is_active ? "success" : "danger"} size="sm" variant="flat">
            //             {item.is_active ? "Active" : "In-active"}
            //         </Chip>
            //     );
            default:
                return <></>;
        }
    },
};
