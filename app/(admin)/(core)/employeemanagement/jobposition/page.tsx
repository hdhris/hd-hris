"use client";
import React, { useEffect, useState } from "react";
import { useJobpositionData } from "@/services/queries";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import AddJobPosition from "@/components/admin/add/AddJob";
import EditJobPosition from "@/components/admin/edit/EditJob";
import axios from "axios";
import { Chip } from "@nextui-org/react";
import DataDisplay from "@/components/common/data-display/data-display";
import BorderCard from "@/components/common/BorderCard";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import showDialog from "@/lib/utils/confirmDialog";

interface JobPosition {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  trans_employees?: Array<{
    id: number;
  }>;
}

const Page: React.FC = () => {
  const { data: jobPositions, error, mutate } = useJobpositionData();
  const [sortedJobPositions, setSortedJobPositions] = useState<JobPosition[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (jobPositions) {
      const sorted = sortJobPositionsByRecentActivity(jobPositions);
      setSortedJobPositions(sorted);
    }
  }, [jobPositions]);

  const sortJobPositionsByRecentActivity = (positions: JobPosition[]) => {
    return [...positions].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });
  };

  SetNavEndContent(() => (
    <div className="flex items-center gap-4">
      <AddJobPosition onJobAdded={handleJobUpdated} />
    </div>
  ));

  const handleEdit = (job: JobPosition) => {
    setSelectedJobId(job.id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      const result = await showDialog({
        title: "Confirm Delete",
        message: `Are you sure you want to delete '${name}' ?`,
      });
      if (result === "yes") {
        await axios.delete(`/api/employeemanagement/jobposition?id=${id}`);
        toast({
          title: "Deleted",
          description: "Job position deleted successfully!",
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

  const handleJobUpdated = async () => {
    try {
      const updatedData = await mutate();
      if (updatedData) {
        const sorted = sortJobPositionsByRecentActivity(updatedData);
        setSortedJobPositions(sorted);
      }
    } catch (error) {
      console.error("Error updating job position data:", error);
    }
  };

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "employeeCount", name: "No. of Employees", sortable: true },
      { uid: "status", name: "Status", sortable: true },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (job: JobPosition, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;
      const cellClasses = "cursor-pointer hover:bg-gray-50";

      switch (key) {
        case "name":
          return (
            <div className={cellClasses}>
              <span>{job.name}</span>
            </div>
          );
        case "employeeCount":
          return (
            <div className={cellClasses}>
              <span>{job.trans_employees?.length || 0}</span>
            </div>
          );
        case "status":
          return (
            <div className={cellClasses}>
              <Chip
                className="capitalize"
                color={job.is_active ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {job.is_active ? "Active" : "Inactive"}
              </Chip>
            </div>
          );
        case "actions":
          return (
            <TableActionButton
              name={job.name}
              onEdit={() => handleEdit(job)}
              onDelete={() => handleDelete(job.id, job.name)}
            />
          );
        default:
          return <div>-</div>;
      }
    },
  };

  const sortProps = {
    sortItems: [
      { name: "Name", key: "name" as keyof JobPosition },
      { name: "Created At", key: "created_at" as keyof JobPosition },
      { name: "Updated At", key: "updated_at" as keyof JobPosition },
    ],
  };

  const FilterItems = [
    {
      category: "Status",
      filtered: [
        { key: "is_active", value: true, name: "Active", uid: "active" },
        { key: "is_active", value: false, name: "Inactive", uid: "inactive" },
      ],
    },
  ];
  

  return (
    <div className="p-4">
      <DataDisplay
        title={`Job Positions (${sortedJobPositions?.length || 0})`}
        data={sortedJobPositions}
        filterProps={{
          filterItems: FilterItems,
        }}
        onTableDisplay={{
          config: TableConfigurations,
          isLoading: !jobPositions && !error,
          layout: "auto",
        }}
        searchProps={{
          searchingItemKey: ["name"],
        }}
        sortProps={sortProps}
        onListDisplay={(job) => (
          <div className="w-full">
            <BorderCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{job.name}</span>
                  <span className="text-sm text-gray-500">
                    {job.trans_employees?.length || 0} employees
                  </span>
                </div>
                <Chip
                  className="capitalize"
                  color={job.is_active ? "success" : "danger"}
                  size="sm"
                  variant="flat"
                >
                  {job.is_active ? "Active" : "Inactive"}
                </Chip>
              </div>
            </BorderCard>
          </div>
        )}
        onExport={{
          drawerProps: {
            title: "Export",
          },
        }}
        onImport={{
          drawerProps: {
            title: "Import",
          },
        }}
      />

      {selectedJobId !== null && (
        <EditJobPosition
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          jobId={selectedJobId}
          onJobUpdated={handleJobUpdated}
        />
      )}
    </div>
  );
};

export default Page;