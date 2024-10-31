"use client"
import React, { useEffect, useState } from "react";
import TableData from "@/components/tabledata/TableData";
import { TableActionButton } from "@/components/actions/ActionButton";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { toast } from "@/components/ui/use-toast";
import AddDepartment from "@/components/admin/add/AddDepartment";
import EditDepartment from "@/components/admin/edit/EditDepartment";
import { useDepartmentsData } from "@/services/queries";
import { Department } from "@/types/employeee/DepartmentType";
import axios from "axios";
import { Chip } from "@nextui-org/react";
//
const Page: React.FC = () => {
  const { data: departments, error, mutate } = useDepartmentsData();
  const [loading, setLoading] = useState(true);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (departments) {
      setLoading(false);
    }
  }, [departments]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch departments. Please try again.",
        duration: 3000,
      });
      setLoading(false);
    }
  }, [error]);

  const handleEdit = async (department: Department) => {
    setSelectedDepartmentId(department.id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/employeemanagement/department?id=${id}`);
      setDeleteSuccess(true);
      await mutate();
    } catch (error) {
      console.error("Error deleting department:", error);
      toast({
        title: "Error",
        description: "Failed to delete department. Please try again.",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (!loading && deleteSuccess) {
      toast({
        title: "Success",
        description: "Department successfully deleted!",
        duration: 3000,
      });
      setDeleteSuccess(false);
    }
  }, [loading, deleteSuccess]);

  const config: TableConfigProps<Department> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "color", name: "Color", sortable: false },
      { uid: "employeeCount", name: "No. of Employees", sortable: true },
      { uid: "is_active", name: "Status", sortable: true },
      { uid: "actions", name: "Actions", sortable: false },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return <span>{item.name}</span>;
        case "color":
          return (
            <div className="flex items-center">
              <div
                className="w-6 h-6 rounded-full mr-2"
                style={{ backgroundColor: item.color || 'gray' }}
              ></div>
            </div>
          );
        case "employeeCount":
          return <span>{item.employeeCount}</span>;
        case "is_active":
          return (
            <Chip
              className="capitalize"
              color={item.is_active ? "success" : "danger"}
              size="sm"
              variant="flat"
            >
              {item.is_active ? 'Active' : 'Inactive'}
            </Chip>
          );
        case "actions":
          return (
            <TableActionButton
              name={item.name}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          );
        default:
          return <></>;
      }
    },
  };

  const searchingItemKey: (keyof Department)[] = ["name", "color"];

  const handleDepartmentUpdated = async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error updating department list:", error);
    }
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
    <div id="department-page" className="h-fit-navlayout">
      <TableData
        aria-label="Department Table"
        config={config}
        items={departments || []}
        searchingItemKey={searchingItemKey}
        counterName="Departments"
        filterItems={FilterItems}
        // selectionMode="multiple"
        isLoading={loading}
        isHeaderSticky={true}
        classNames={{
          wrapper: "h-[27rem] overflow-y-auto",
        }}
        endContent={() => (
          <div className="flex items-center justify-between">
            <div className="ml-4">
              <AddDepartment onDepartmentAdded={handleDepartmentUpdated} />
            </div>
            <div className="ml-auto mr-4"></div>
          </div>
        )}
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