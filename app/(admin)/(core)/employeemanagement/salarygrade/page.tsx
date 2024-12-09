"use client";
import React, { useEffect, useState } from "react";
import { useSalaryGradeData } from "@/services/queries";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import AddSalaryGrade from "@/components/admin/employeescomponent/store/AddSalaryGrade";
import EditSalaryGrade from "@/components/admin/employeescomponent/update/EditSalaryGrade";
import axios from "axios";
import DataDisplay from "@/components/common/data-display/data-display";
import BorderCard from "@/components/common/BorderCard";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import showDialog from "@/lib/utils/confirmDialog";
import { SalaryGrade } from "@/types/employeee/SalaryType";

const Page: React.FC = () => {
  const { data: salaryGrade, error, mutate } = useSalaryGradeData();
  const [sortedSalaryGrade, setSortedSalaryGrade] = useState<SalaryGrade[]>([]);
  const [selectedSalaryGradeId, setSelectedSalaryGradeId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (salaryGrade) {
      const sorted = sortsalaryGradeByRecentActivity(salaryGrade);
      setSortedSalaryGrade(sorted);
    }
  }, [salaryGrade]);

  

  const sortsalaryGradeByRecentActivity = (positions: SalaryGrade[]) => {
    return [...positions].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });
  };

  SetNavEndContent(() => (
    <div className="flex items-center gap-4">
      <AddSalaryGrade onSalaryAdded={handleSalaryGradeUpdated} />
    </div>
  ));

  const handleEdit = (salary: SalaryGrade) => {
    setSelectedSalaryGradeId(salary.id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      const result = await showDialog({
        title: "Confirm Delete",
        message: `Are you sure you want to delete '${name}' ?`,
      });
      if (result === "yes") {
        await axios.delete(`/api/employeemanagement/salarygrade?id=${id}`);
        toast({
          title: "Deleted",
          description: "Salary Grade deleted successfully!",
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

  const handleSalaryGradeUpdated = async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error updating job position data:", error);
    }
  };

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "amount", name: "Amount", sortable: true },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (salary: SalaryGrade, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;
      const cellClasses = "cursor-pointer hover:bg-gray-50";

      switch (key) {
        case "name":
          return (
            <div className={cellClasses}>
              <span>{salary.name}</span>
            </div>
          );
        case "amount":
          return (
            <div className={cellClasses}>
              <span>{salary.amount || 0.00}</span>
            </div>
          );
        case "actions":
          return (
            <TableActionButton
              name={salary.name}
              onEdit={() => handleEdit(salary)}
              onDelete={() => handleDelete(salary.id, salary.name)}
            />
          );
        default:
          return <div>-</div>;
      }
    },
  };

  const sortProps = {
    sortItems: [
      { name: "Name", key: "name" as keyof SalaryGrade },
      { name: "Created", key: "created_at" as keyof SalaryGrade },
      { name: "Updated", key: "updated_at" as keyof SalaryGrade },
    ],
  };


  return (
    <div className="h-[calc(100vh-150px)] overflow-hidden">
      <DataDisplay
        defaultDisplay="table"
        title={`Salary Grade (${sortedSalaryGrade?.length || 0})`}
        data={sortedSalaryGrade}
        isLoading={!salaryGrade && !error}
        onTableDisplay={{
          config: TableConfigurations,
          className: "h-full overflow-auto",
          layout: "auto",
        }}
        searchProps={{
          searchingItemKey: ["name"],
        }}
        sortProps={sortProps}
        onListDisplay={(salary) => (
          <div className="w-full">
            <BorderCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{salary.name}</span>
                </div>
                <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <span className="font-medium">{salary.amount}</span>
                </div>
                </div>
              </div>
            </BorderCard>
          </div>
        )}
        paginationProps={{
          data_length: salaryGrade?.length
        }}
      />

      {selectedSalaryGradeId !== null && (
        <EditSalaryGrade
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          salaryGradeId={selectedSalaryGradeId}
          onSalaryGradeUpdated={handleSalaryGradeUpdated}
        />
      )}
    </div>
  );
};

export default Page;