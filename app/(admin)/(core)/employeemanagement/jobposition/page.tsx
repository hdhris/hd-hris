"use client"

import React, { useEffect, useState } from "react";
import { useJobpositionData } from "@/services/queries";
import TableData from "@/components/tabledata/TableData";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Button, Selection, Chip } from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import AddJobPosition from "@/components/admin/add/AddJob";
import EditJobPosition from "@/components/admin/edit/EditJob";
import axios from "axios";
import showDialog from "@/lib/utils/confirmDialog";
import { FilterProps } from "@/types/table/default_config";

interface JobPosition {
  id: number;
  name: string;
  is_active: boolean;
  trans_employees?: Array<{
    id: number;
  }>;
}

const Page: React.FC = () => {
  const { data: jobPositions, mutate, error } = useJobpositionData();
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (jobPositions) {
      setLoading(false);
    }
  }, [jobPositions]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch job positions. Please try again.",
        duration: 3000,
      });
      setLoading(false);
    }
  }, [error]);

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
      await mutate();
    } catch (error) {
      console.error("Error updating job position data:", error);
    }
  };

  const config: TableConfigProps<JobPosition> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "employeeCount", name: "No. of Employees", sortable: true },
      { uid: "status", name: "Status", sortable: true },
      { uid: "actions", name: "Actions", sortable: false },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return <div>{item.name}</div>;
        case "employeeCount":
          return <div>{item.trans_employees?.length || 0}</div>;
        case "status":
          return (
            <Chip
              className="capitalize"
              color={item.is_active ? "success" : "danger"}
              size="sm"
              variant="flat"
            >
              {item.is_active ? "Active" : "Inactive"}
            </Chip>
          );
        case "actions":
          return (
            <TableActionButton
              name={item.name}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id, item.name)}
            />
          );
        default:
          return <></>;
      }
    },
  };

  const searchingItemKey: (keyof JobPosition)[] = ["name"];

  const jobItems: JobPosition[] =
    jobPositions?.map((job) => ({
      ...job,
      trans_employees: job.trans_employees || [],
    })) || [];

  return (
    <div id="job-position-page" className="mt-2">
      <TableData
        aria-label="Job Position Table"
        config={config}
        items={jobItems}
        searchingItemKey={searchingItemKey}
        counterName="Job Positions"
        isLoading={loading}
        isHeaderSticky={true}
        classNames={{
          wrapper: "h-[27rem] overflow-y-auto",
        }}
        contentTop={
          <div className="flex items-center justify-between">
            <div className="ml-4">
              <AddJobPosition onJobAdded={handleJobUpdated} />
            </div>
            <div className="ml-auto mr-4"></div>
          </div>
        }
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