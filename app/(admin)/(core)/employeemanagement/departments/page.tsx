"use client";
import React, { useEffect, useState } from "react";
import { useDepartmentsData } from "@/services/queries";
import { Department } from "@/types/employeee/DepartmentType";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import AddDepartment from "@/components/admin/employeescomponent/store/AddDepartment";
import EditDepartment from "@/components/admin/employeescomponent/update/EditDepartment";
import axios from "axios";
import { Chip } from "@nextui-org/react";
import DataDisplay from "@/components/common/data-display/data-display";
import BorderCard from "@/components/common/BorderCard";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import showDialog from "@/lib/utils/confirmDialog";

const Page: React.FC = () => {
  const { data: departments, error, mutate } = useDepartmentsData();
  const [sortedDepartments, setSortedDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//
  useEffect(() => {
    if (departments) {
      const sorted = sortDepartmentsByRecentActivity(departments);
      setSortedDepartments(sorted);
    }
  }, [departments]);

  const sortDepartmentsByRecentActivity = (departments: Department[]) => {
    return [...departments].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });
  };

  SetNavEndContent(() => (
    <div className="flex items-center gap-4">
      <AddDepartment onDepartmentAdded={handleDepartmentUpdated} />
    </div>
  ));

  const handleEdit = async (department: Department) => {
    setSelectedDepartmentId(department.id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      const result = await showDialog({
        title: "Confirm Delete",
        message: `Are you sure you want to delete '${name}' ?`,
      });
      if (result === "yes") {
        await axios.delete(`/api/employeemanagement/department?id=${id}`);
        toast({
          title: "Deleted",
          description: "Department deleted successfully!",
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

  const handleDepartmentUpdated = async () => {
    try {
      const updatedData = await mutate();
      if (updatedData) {
        const sorted = sortDepartmentsByRecentActivity(updatedData);
        setSortedDepartments(sorted);
      }
    } catch (error) {
      console.error("Error updating department data:", error);
    }
  };

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "color", name: "Color", sortable: false },
      { uid: "employeeCount", name: "No. of Employees", sortable: true },
      { uid: "status", name: "Status", sortable: true },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (department: Department, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;
      const cellClasses = "cursor-pointer hover:bg-gray-50";

      switch (key) {
        case "name":
          return (
            <div className={cellClasses}>
              <span>{department.name}</span>
            </div>
          );
        case "color":
          return (
            <div className={cellClasses}>
              <div className="flex items-center">
                <div
                  className="w-6 h-6 rounded-full mr-2"
                  style={{ backgroundColor: department.color || 'gray' }}
                ></div>
              </div>
            </div>
          );
        case "employeeCount":
          return (
            <div className={cellClasses}>
              <span>{department.employeeCount}</span>
            </div>
          );
        case "status":
          return (
            <div className={cellClasses}>
              <Chip
                className="capitalize"
                color={department.is_active ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {department.is_active ? "Active" : "Inactive"}
              </Chip>
            </div>
          );
        case "actions":
          return (
            <TableActionButton
              name={department.name ?? "Unknown"}
              onEdit={() => handleEdit(department)}
              onDelete={() => handleDelete(department.id, department.name)}
            />
          );
        default:
          return <div>-</div>;
      }
    },
  };

  const sortProps = {
    sortItems: [
      { name: "Name", key: "name" as keyof Department },
      { name: "Created At", key: "created_at" as keyof Department },
      { name: "Updated At", key: "updated_at" as keyof Department },
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
        title='Departments'
        data={sortedDepartments}
        filterProps={{
          filterItems: FilterItems,
        }}
      isLoading={!departments && !error}
        onTableDisplay={{
          config: TableConfigurations,
          className: "h-full overflow-auto",
          layout: "auto",
        }}
        searchProps={{
          searchingItemKey: ["name"],
        }}
        sortProps={sortProps}
        onListDisplay={(department) => (
          <div className="w-full">
            <BorderCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{department.name}</span>
                  <div className="flex items-center mt-1">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: department.color || 'gray' }}
                    ></div>
                    <span className="text-sm text-gray-500">
                      {department.employeeCount} employees
                    </span>
                  </div>
                </div>
                <Chip
                  className="capitalize"
                  color={department.is_active ? "success" : "danger"}
                  size="sm"
                  variant="flat"
                >
                  {department.is_active ? "Active" : "Inactive"}
                </Chip>
              </div>
            </BorderCard>
          </div>
        )}
        paginationProps={{
          data_length: sortedDepartments?.length
        }}
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

      {selectedDepartmentId !== null && (
        <EditDepartment
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          departmentId={selectedDepartmentId}
          onDepartmentUpdated={handleDepartmentUpdated}
        />
      )}
    </div>
  );
};

export default Page;