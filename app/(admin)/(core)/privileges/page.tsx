"use client";
import TableData from "@/components/tabledata/TableData";
import { useQuery } from "@/services/queries";
import { AccessRole } from "@/types/privilege/privilege";
import { Spinner } from "@nextui-org/react";
import React, { useMemo, useState } from "react";
import { privileConfigTable } from "./config";
import ViewPrivilege from "@/components/admin/privilege/view-privilege";

export default function Page() {
    const { data: accessRoles, isLoading } = useQuery<AccessRole[]>("/api/admin/privilege");
    const [selectedAccessRole, setSelectedAccessRole] = useState<AccessRole | null>(null);

    const getAccessRole = useMemo(() => {
        return (key: React.Key) => {
            return accessRoles?.find((role) => role.id === Number(key)) ?? null;
        };
    }, [accessRoles]);

    if (isLoading) {
        return <Spinner color="primary" className="h-full w-full" content="Loading..." />;
    }

    return (
        <div className="h-full w-full flex">
            <TableData
                config={privileConfigTable}
                items={accessRoles ?? []}
                selectionMode="single"
                onRowAction={(key) => setSelectedAccessRole(getAccessRole(key))}
            />
            <ViewPrivilege accessRole={selectedAccessRole} onClose={() => setSelectedAccessRole(null)} />
        </div>
    );
}
