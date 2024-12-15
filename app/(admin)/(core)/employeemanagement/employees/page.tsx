"use client";
import React, { useState } from "react";
import { useEmployeesData } from "@/services/queries";
import { Employee } from "@/types/employeee/EmployeeType";
import { Avatar, Chip } from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";
import AddEmployee from "@/components/admin/employeescomponent/store/AddEmployees";
import DataDisplay from "@/components/common/data-display/data-display";
import Text from "@/components/Text";
import dayjs from "dayjs";
import { SetNavEndContent } from "@/components/common/tabs/NavigationTabs";
import { useRouter } from 'next/navigation';
import ViewEmployee from "@/components/admin/employeescomponent/view/ViewEmployee";

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)]">
      <div className="text-center space-y-3">
        <Text className="text-xl font-bold text-gray-700">No Employees Found</Text>
        <Text className="text-gray-500">There are no active employees at the moment.</Text>
        <Text className="text-sm text-gray-400">Click the &apos;Add Employee&apos; button above to get started.</Text>
      </div>
    </div>
  );
};

const Page: React.FC = () => {
  const { data: employees, mutate, isLoading } = useEmployeesData();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const router = useRouter();

  const handleEditEmployee = (employeeId: number) => {
    router.push(`/employeemanagement/employees/edit-employee/${employeeId.toString()}`);
  };

  const handleEmployeeUpdated = async () => {
    try {
      await mutate();
    } catch (error) {
      console.error("Error updating employee data:", error);
    }
  };

  SetNavEndContent(() => (
    <div className="flex items-center gap-4">
      <AddEmployee onEmployeeAdded={handleEmployeeUpdated} />
    </div>
  ));

  const handleOnSelected = (key: React.Key) => {
    const selected = employees?.find(item => item.id === Number(key));
    setSelectedEmployee(selected ?? null);
  };

  const TableConfigurations = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "department", name: "Department", sortable: true },
      { uid: "position", name: "Position", sortable: true },
      { uid: "contact", name: "Contact" },
      { uid: "hiredate", name: "Hired Date", sortable: true },
      { uid: "employmentstatus", name: "Employment Status", sortable: true },
      { uid: "actions", name: "Actions" },
    ],
    rowCell: (employee: Employee, columnKey: React.Key): React.ReactElement => {
      const key = columnKey as string;

      switch (key) {
        case "name":
          return (
            <div className="flex items-center gap-4">
              <Avatar
                src={employee.picture || ""}
                alt={`${employee.prefix || ''} ${employee.first_name} ${employee.last_name}`}
              />
              <span>
                {employee.prefix && `${employee.prefix} `}
                {employee.first_name} {employee.last_name}
                {employee.suffix ? `, ${employee.suffix}` : ""}
                {employee.extension ? ` ${employee.extension}` : ""}
              </span>
            </div>
          );
        case "department":
          return <div>{employee.ref_departments?.name || "N/A"}</div>;
        case "position":
          return <div>{employee.ref_job_classes?.name || "N/A"}</div>;
        case "contact":
          return (
            <div className="flex flex-col">
              <span>{employee.email || "N/A"}</span>
              <span>+63{employee.contact_no || "N/A"}</span>
            </div>
          );
        case "hiredate":
          return (
            <div>
              {employee.hired_at
                ? dayjs(employee.hired_at).format("MMM DD, YYYY")
                : "N/A"}
            </div>
          );
        case "employmentstatus":
          return (
            <div className="flex items-center justify-center">
              {employee.ref_employment_status?.name || "N/A"}
            </div>
          );
        case "actions":
          return (
            <TableActionButton
              name={`${employee.first_name} ${employee.last_name}`}
              onEdit={() => handleEditEmployee(employee.id)}              
            />
          );
        default:
          return <div>-</div>;
      }
    },
  };

  const FilterItems = [
    {
      category: "Employee status",
      filtered: employees?.length 
        ? Array.from(
            new Set(employees.map((e) => e.ref_employment_status?.name))
          )
            .filter(Boolean)
            .map((empstat) => ({
              key: "ref_employment_status.name",
              value: empstat || "",
              name: empstat || "",
              uid: empstat|| "",
            }))
        : [],
    },
    {
      category: "Department",
      filtered: employees?.length 
        ? Array.from(
            new Set(employees.map((e) => e.ref_departments?.name))
          )
            .filter(Boolean)
            .map((dept) => ({
              key: "ref_departments.name",
              value: dept || "",
              name: dept || "",
              uid: dept || "",
            }))
        : [],
    },
    {
      category: "Job Position",
      filtered: employees?.length
        ? Array.from(
            new Set(employees.map((e) => e.ref_job_classes?.name))
          )
            .filter(Boolean)
            .map((job) => ({
              key: "ref_job_classes.name",
              value: job || "",
              name: job || "",
              uid: job || "",
            }))
        : [],
    },
  ];

  const sortProps = {
    sortItems: [
      { name: "First Name", key: "first_name" as keyof Employee },
      { name: "Last Name", key: "last_name" as keyof Employee },
      { name: "Created", key: "created_at" as keyof Employee },
      { name: "Updated", key: "updated_at" as keyof Employee },
      { name: "Hired Date", key: "hired_at" as keyof Employee },
    ],
  };

  if (isLoading) {
    return (
      <section className='w-full h-full flex'>
        <DataDisplay
          defaultDisplay="table"
          title="Active Employees"
          data={[]}
          isLoading={true}
          onTableDisplay={{
            config: TableConfigurations,
            layout: "auto"
          }}
        />
      </section>
    );
  }

  if (!employees || employees.length === 0) {
    return <EmptyState />;
  }
  return (
    <section className='w-full h-full flex gap-4'>
      <DataDisplay
        defaultDisplay="table"
        title="Active Employees"
        data={employees}
        filterProps={{
          filterItems: FilterItems,
        }}
        isLoading={false}
        onTableDisplay={{
          config: TableConfigurations,
          layout: "auto",
          onRowAction: handleOnSelected
        }}
        paginationProps={{
          data_length: employees.length,
        }}
        searchProps={{
          searchingItemKey: ["first_name", "last_name", "email", "contact_no"],
        }}
        sortProps={sortProps}
        onView={selectedEmployee && (
          <div className="max-w-[500px] overflow-y-auto">
          <ViewEmployee
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
            onEmployeeUpdated={handleEmployeeUpdated}
            sortedEmployees={employees}
          />
          </div>
        )}
      />
    </section>
  );
};

export default Page;