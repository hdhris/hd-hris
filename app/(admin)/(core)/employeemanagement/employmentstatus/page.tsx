"use client";
import React, { useEffect, useState } from "react";

import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { Chip } from "@nextui-org/react";
import DataDisplay from "@/components/common/data-display/data-display";
import BorderCard from "@/components/common/BorderCard";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import showDialog from "@/lib/utils/confirmDialog";

import { useEmploymentStatusData } from "@/services/queries";
import AddEmployee from "@/components/admin/employeescomponent/store/AddEmployees";
import { EmploymentStatus } from "@/types/employeee/EmploymentStatusType";
import AddEmploymentStatus from "@/components/admin/employeescomponent/store/AddEmploymentStatus";
import EditEmploymentStatus from "@/components/admin/employeescomponent/update/EditEmploymentStatus";

const Page: React.FC = () => {
  const { data: empStatus, error, mutate } = useEmploymentStatusData();
  const [sortedEmploymentStatus, setSortedEmploymentStatus] = useState<
    EmploymentStatus[]
  >([]);
  const [selectedEmploymentStatusId, setSelectedEmploymentStatusId] = useState<
    number | null
  >(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (empStatus) {
      const sorted = sortEmploymentStatusByRecentActivity(empStatus);
      setSortedEmploymentStatus(sorted);
    }
  }, [empStatus]);

  const sortEmploymentStatusByRecentActivity = (
    positions: EmploymentStatus[]
  ) => {
    return [...positions].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });
  };

  SetNavEndContent(() => (
    <div className="flex items-center gap-4">
      <AddEmploymentStatus
        onEmploymentStatusAdded={handleEmploymentStatusUpdated}
      />
    </div>
  ));

  const handleEdit = (empstatus: EmploymentStatus) => {
    setSelectedEmploymentStatusId(empstatus.id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      const result = await showDialog({
        title: "Confirm Delete",
        message: `Are you sure you want to delete '${name}' ?`,
      });
      if (result === "yes") {
        await axios.delete(`/api/employeemanagement/employmentstatus?id=${id}`);
        toast({
          title: "Deleted",
          description: "Employment Status deleted successfully!",
          variant: "warning",
        });
        await mutate();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error: " + error,
        variant: "danger",
      });
    }
  };

  const handleEmploymentStatusUpdated = async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error updating employment status data:", error);
    }
  };

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "employeecount", name: "Total No. of Employees", sortable: true },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (
      empStatus: EmploymentStatus,
      columnKey: React.Key
    ): React.ReactElement => {
      const key = columnKey as string;
      const cellClasses = "cursor-pointer hover:bg-gray-50";

      switch (key) {
        case "name":
          return (
            <div className={cellClasses}>
              <span>{empStatus.name}</span>
            </div>
          );
          case "employeecount":
          return (
            <div className={cellClasses}>
              <span>{empStatus.employeeCount}</span>
            </div>
          );
        case "actions":
          return (  
            <TableActionButton
              name={empStatus.name}
              onEdit={() => handleEdit(empStatus)}
              onDelete={() => handleDelete(empStatus.id, empStatus.name)}
            />
          );
        default:
          return <div>-</div>;
      }
    },
  };

  const sortProps = {
    sortItems: [
      { name: "Name", key: "name" as keyof EmploymentStatus },
      { name: "Created", key: "created_at" as keyof EmploymentStatus },
      { name: "Updated", key: "updated_at" as keyof EmploymentStatus },
    ],
  };

  return (
    <div className="h-[calc(100vh-150px)] overflow-hidden">
      <DataDisplay
        defaultDisplay="table"
        title={`Employment Status(${sortedEmploymentStatus?.length || 0})`}
        data={sortedEmploymentStatus}
        isLoading={!empStatus && !error}
        onTableDisplay={{
          config: TableConfigurations,
          className: "h-full overflow-auto",
          layout: "auto",
        }}
        searchProps={{
          searchingItemKey: ["name"],
        }}
        paginationProps={{
          data_length: empStatus?.length,
        }}
      />

      {selectedEmploymentStatusId !== null && (
        <EditEmploymentStatus
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          empStatusId={selectedEmploymentStatusId}
          onEmpStatusUpdated={handleEmploymentStatusUpdated}
        />
      )}
    </div>
  );
};

export default Page;
