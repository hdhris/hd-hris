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

const Page: React.FC = () => {
  const { data: departments, error, mutate } = useDepartmentsData();
  const { data: employees = [] } = useEmployeesData();
  const [sortedDepartments, setSortedDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

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

  const findDepartmentHead = (departmentId: number) => {
    return employees.find(
      (employee) =>
        Number(employee.department_id) === departmentId &&
        employee.ref_job_classes?.is_superior === true
    );
  };

  const countDepartmentEmployees = (departmentId: number): number => {
    return employees.filter(
      (employee) => Number(employee.department_id) === departmentId
    ).length;
  };

  const sortDepartmentsByRecentActivity = (departments: Department[]): Department[] => {
    return [...departments].sort((a, b) => {
      const dateA = new Date(a.updated_at).getTime();
      const dateB = new Date(b.updated_at).getTime();
      return dateB - dateA;
    });
  };

  SetNavEndContent(() => (
    <div className="flex items-center gap-4">
      <AddDepartment onDepartmentAdded={handleDepartmentUpdated} />
    </div>
  ));

  const handleOnSelected = (key: React.Key) => {
    const selected = sortedDepartments?.find((item) => item.id === Number(key));
    setSelectedDepartment(selected ?? null);
  };

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
      if (error instanceof AxiosError) {
        toast({
          title: "Error",
          description: error.response?.data.message,
          variant: "danger",
        });
      }
    }
  };

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
      console.error("Error updating department data:", error);
    }
  };

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "departmentHead", name: "Department In Charge", sortable: false, width: "15%" },
      { uid: "color", name: "Color", sortable: false },
      { uid: "employeeCount", name: "No. of Employees", sortable: true },
      { uid: "status", name: "Status", sortable: true },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (department: Department, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;
      const cellClasses = "cursor-pointer capitalize";
      const departmentHead = findDepartmentHead(department.id);

      switch (key) {
        case "name":
          return (
            <div className={cellClasses}>
              <span>{department.name}</span>
            </div>
          );
        case "departmentHead":
          return (
            <div>
              {departmentHead ? (
                <div className="pl-8">
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
                </div>
              ) : (
                <span className="text-gray-400">No department in charge</span>
              )}
            </div>
          );
        case "color":
          return (
            <div className={cellClasses}>
              <div className="flex items-center">
                <div
                  className="w-6 h-6 rounded-full mr-2"
                  style={{ backgroundColor: department.color || "gray" }}
                ></div>
              </div>
            </div>
          );
        case "employeeCount":
          return (
            <div className="pl-8">
              <span className="font-extrabold">{department.employeeCount}</span>
            </div>
          );
        case "status":
          return (
            <div className={cellClasses}>
              <Chip
                className="capitalize"
                color={department.is_active ? "success" : "danger"}
                size="md"
                variant="dot"
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
      { name: "Created", key: "created_at" as keyof Department },
      { name: "Updated", key: "updated_at" as keyof Department },
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
    <section className="w-full h-full flex gap-4">
      <DataDisplay
        defaultDisplay="table"
        title="Departments"
        data={sortedDepartments}
        filterProps={{
          filterItems: FilterItems,
        }}
        isLoading={!departments && !error}
        onTableDisplay={{
          config: TableConfigurations,
          className: "h-full overflow-auto cursor-pointer",
          layout: "auto",
          onRowAction: handleOnSelected,
        }}
        searchProps={{
          searchingItemKey: ["name"],
        }}
        sortProps={sortProps}
        paginationProps={{
          data_length: departments?.length,
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
        onListDisplay={(department) => (
          <div className="w-full">
            <BorderCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{department.name}</span>
                    {(() => {
                      const departmentHead = findDepartmentHead(department.id);
                      return (
                        departmentHead && (
                          <UserAvatarTooltip
                            user={{
                              name: `${departmentHead.first_name} ${departmentHead.last_name}`,
                              picture: departmentHead.picture || "",
                              id: departmentHead.id,
                            }}
                            avatarProps={{
                              classNames: { base: "!size-6" },
                              isBordered: true,
                            }}
                          />
                        )
                      );
                    })()}
                  </div>
                  <div className="flex items-center mt-1">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: department.color || "gray" }}
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

export default Page;