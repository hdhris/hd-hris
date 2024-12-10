"use client";
import React, { useEffect, useState } from "react";
import { useJobpositionData } from "@/services/queries";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import AddJobPosition from "@/components/admin/employeescomponent/store/AddJob";
import EditJobPosition from "@/components/admin/employeescomponent/update/EditJob";
import axios, { AxiosError } from "axios";
import { Chip } from "@nextui-org/react";
import DataDisplay from "@/components/common/data-display/data-display";
import BorderCard from "@/components/common/BorderCard";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import showDialog from "@/lib/utils/confirmDialog";
import { JobPosition } from "@/types/employeee/JobType";

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

  const getSuperiorName = (job: JobPosition): string => {
    if (!job.superior_id || !jobPositions) return "None";
    const superior = jobPositions.find(p => p.id === job.superior_id);
    return superior ? superior.name : "None";
  };

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

      if(error instanceof AxiosError){
        toast({
          title: "Error",
          description: error.response?.data.message,
          variant: "danger",
        });
      }
      
    }
  };

  const handleJobUpdated = async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error updating job position data:", error);
    }
  };

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "superior", name: "Superior", sortable: true },
      { uid: "employeeCount", name: "No. of Employees", sortable: true },
      { uid: "pay_rate", name: "Payrate", sortable: true },
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
        case "superior":
          return (
            <div className={cellClasses}>
              <span>{getSuperiorName(job)}</span>
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
        case "pay_rate":
          return (
            <div className={cellClasses}>
              <span>{job.pay_rate}</span>
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
      { name: "Created", key: "created_at" as keyof JobPosition },
      { name: "Updated", key: "updated_at" as keyof JobPosition },
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
    <div className="h-[calc(100vh-150px)] overflow-hidden">
      <DataDisplay
        defaultDisplay="table"
        title={`Job Positions (${sortedJobPositions?.length || 0})`}
        data={sortedJobPositions}
        filterProps={{
          filterItems: FilterItems,
        }}
        isLoading={!jobPositions && !error}
        onTableDisplay={{
          config: TableConfigurations,
          className: "h-full overflow-auto",
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
                    Superior: {getSuperiorName(job)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {job.trans_employees?.length || 0} employees
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Chip
                    className="capitalize"
                    color={job.is_active ? "success" : "danger"}
                    size="sm"
                    variant="flat"
                  >
                    {job.is_active ? "Active" : "Inactive"} 
                  </Chip>
                </div>
              </div>
            </BorderCard>
          </div>
        )}
        paginationProps={{
          data_length: jobPositions?.length
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