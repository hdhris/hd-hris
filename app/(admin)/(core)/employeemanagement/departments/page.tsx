// app/admin/departments/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useDepartmentsData, useEmployeesData } from "@/services/queries";
import { Department } from "@/types/employeee/DepartmentType";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import AddDepartment from "@/components/admin/employeescomponent/store/AddDepartment";
import EditDepartment from "@/components/admin/employeescomponent/update/EditDepartment";
import ViewDepartment from "@/components/admin/employeescomponent/view/ViewDepartment";
import axios, { AxiosError } from "axios";
import { Chip } from "@nextui-org/react";
import DataDisplay from "@/components/common/data-display/data-display";
import BorderCard from "@/components/common/BorderCard";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import showDialog from "@/lib/utils/confirmDialog";
import UserAvatarTooltip from "@/components/common/avatar/user-avatar-tooltip";
import { isEmployeeAvailable } from "@/helper/employee/unavailableEmployee";
// import { isEmployeeAvailable } from "@/lib/utils/employeeUtils"; // Adjust import path


const DepartmentsPage: React.FC = () => {
  const { data: departments, error, mutate } = useDepartmentsData();
  const { data: employees = [] } = useEmployeesData();
  
  const [sortedDepartments, setSortedDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Utility function to find department head
  const findDepartmentHead = (departmentId: number) => {
    return employees.find(
      (employee) =>
        Number(employee.department_id) === departmentId &&
        employee.ref_job_classes?.is_superior === true &&
        isEmployeeAvailable(employee)
    );
  };
  
  // Count active employees in a department
  const countDepartmentEmployees = (departmentId: number): number => {
    return employees.filter(
      (employee) =>
        Number(employee.department_id) === departmentId &&
        isEmployeeAvailable(employee)
    ).length;
  };

  // Sort departments by most recently updated
  const sortDepartmentsByRecentActivity = (departments: Department[]): Department[] => {
    return [...departments].sort((a, b) => {
      const dateA = new Date(a.updated_at).getTime();
      const dateB = new Date(b.updated_at).getTime();
      return dateB - dateA;
    });
  };

  // Update departments when data changes
  useEffect(() => {
    if (departments) {
      const sorted = sortDepartmentsByRecentActivity(departments);
      setSortedDepartments(
        sorted.map((dept) => ({
          ...dept,
          employeeCount: countDepartmentEmployees(dept.id),
        }))
      );
    }
  }, [departments, employees]);

  // Department edit handler
  const handleEdit = async (department: Department) => {
    setSelectedDepartmentId(department.id);
    setIsEditModalOpen(true);
  };

  // Department delete handler
  const handleDelete = async (id: number, name: string) => {
    try {
      const result = await showDialog({
        title: "Confirm Delete",
        message: `Are you sure you want to delete '${name}' department?`,
      });

      if (result === "yes") {
        await axios.delete(`/api/employeemanagement/department?id=${id}`);
        toast({
          title: "Department Deleted",
          description: "Department successfully removed from the system.",
          variant: "warning",
        });
        await mutate();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: "Error",
          description: error.response?.data.message,
          variant: "danger",
        });
      }
    }
  };

  // Department update handler
  const handleDepartmentUpdated = async () => {
    try {
      const updatedData = await mutate();
      if (updatedData) {
        const sorted = sortDepartmentsByRecentActivity(updatedData);
        setSortedDepartments(
          sorted.map((dept) => ({
            ...dept,
            employeeCount: countDepartmentEmployees(dept.id),
          }))
        );
      }
    } catch (error) {
      console.error("Department update error:", error);
      toast({
        title: "Update Failed",
        description: "Unable to refresh department data",
        variant: "danger",
      });
    }
  };

  // Table configurations
  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "departmentHead", name: "Department Head", sortable: false },
      { uid: "color", name: "Color", sortable: false },
      { uid: "employeeCount", name: "Employees", sortable: true },
      { uid: "status", name: "Status", sortable: true },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (department: Department, columnKey: React.Key) => {
      const departmentHead = findDepartmentHead(department.id);

      switch (columnKey) {
        case "name":
          return <div className="capitalize">{department.name}</div>;
        
        case "departmentHead":
          return departmentHead ? (
            <UserAvatarTooltip
              user={{
                name: `${departmentHead.first_name} ${departmentHead.last_name}`,
                picture: departmentHead.picture || "",
                id: departmentHead.id,
              }}
              avatarProps={{
                classNames: { base: "!size-9" },
                isBordered: true,
              }}
            />
          ) : (
            <span className="text-gray-400">Unassigned</span>
          );
        
        case "color":
          return (
            <div 
              className="w-6 h-6 rounded-full" 
              style={{ backgroundColor: department.color || "gray" }}
            />
          );
        
        case "employeeCount":
          return <span className="font-bold">{department.employeeCount}</span>;
        
        case "status":
          return (
            <Chip
              color={department.is_active ? "success" : "danger"}
              variant="dot"
              size="sm"
            >
              {department.is_active ? "Active" : "Inactive"}
            </Chip>
          );
        
        case "actions":
          return (
            <TableActionButton
              name={department.name || "Unknown"}
              onEdit={() => handleEdit(department)}
              onDelete={() => handleDelete(department.id, department.name)}
            />
          );
        
        default:
          return <div>-</div>;
      }
    },
  };

  return (
    <section className="w-full h-full flex gap-4">
      <DataDisplay
        defaultDisplay="table"
        title="Departments"
        data={sortedDepartments}
        isLoading={!departments && !error}
        onTableDisplay={{
          config: TableConfigurations,
          className: "h-full overflow-auto",
          layout: "auto",
          onRowAction: (key) => {
            const selected = sortedDepartments?.find((item) => item.id === Number(key));
            setSelectedDepartment(selected ?? null);
          },
        }}
        onView={
          selectedDepartment && (
            <ViewDepartment
              department={selectedDepartment}
              onClose={() => setSelectedDepartment(null)}
              onDepartmentUpdated={handleDepartmentUpdated}
              employees={employees}
            />
          )
        }
      />

      {selectedDepartmentId !== null && (
        <EditDepartment
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          departmentId={selectedDepartmentId}
          onDepartmentUpdated={handleDepartmentUpdated}
        />
      )}
    </section>
  );
};

export default DepartmentsPage;