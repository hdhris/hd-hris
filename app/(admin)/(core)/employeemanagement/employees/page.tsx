"use client"
import React, { useEffect, useState } from "react";
import { useEmployeesData } from "@/services/queries";
import TableData from "@/components/tabledata/TableData";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Employee } from "@/types/employeee/EmployeeType";
import { Avatar, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import AddEmployee from "@/components/admin/add/AddEmployees";
import EditEmployee from "@/components/admin/edit/EditEmployee";
import EmployeeModal from "@/components/admin/add/EmployeeModal";
import axios from "axios";

const Page: React.FC = () => {
  const { data: employees, mutate, error } = useEmployeesData();
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isOpen: isDeleteModalOpen, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (employees) {
      setLoading(false);
    }
  }, [employees]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees. Please try again.",
        duration: 3000,
      });
      setLoading(false);
    }
  }, [error]);

  const handleStatusAction = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsStatusModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployeeId(employee.id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedEmployeeId !== null) {
      try {
        await axios.delete(`/api/employeemanagement/employees?id=${selectedEmployeeId}`);
        toast({
          title: "Success",
          description: "Employee successfully deleted!",
          duration: 3000,
        });
        await mutate();
        onCloseDeleteModal();
      } catch (error) {
        console.error("Error deleting employee:", error);
        toast({
          title: "Error",
          description: "Failed to delete employee. Please try again.",
          duration: 3000,
        });
      }
    }
  };

  const handleEmployeeUpdated = async () => {
    try {
      await mutate();
      console.log("Employee data updated");
    } catch (error) {
      console.error("Error updating employee data:", error);
    }
  };

  const getEmployeeStatus = (employee: Employee): string => {
    if (employee.termination_json) return "Terminated";
    if (employee.resignation_json) return "Resigned";
    if (employee.suspension_json) return "Suspended";
    return "Active";
  };

  const config: TableConfigProps<Employee> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "department", name: "Department", sortable: false },
      { uid: "position", name: "Position", sortable: false },
      { uid: "contact", name: "Contact", sortable: false },
      { uid: "hiredate", name: "Hired Date", sortable: false },
      { uid: "status", name: "Status", sortable: false },
      { uid: "actions", name: "Actions", sortable: false },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <div className="flex items-center">
              <Avatar
                src={item.picture || ""}
                alt={`${item.first_name} ${item.last_name}`}
                className="w-10 h-10 rounded-full mr-10"
              />
              <span>
                {item.first_name} {item.last_name}
                {item.suffix && item.suffix.length > 0 ? `, ${item.suffix}` : ""}
                {item.suffix && item.extension ? `, ${item.extension}` : item.extension ? ` ${item.extension}` : ""}
              </span>
            </div>
          );
        case "position":
          return <div>{item.ref_job_classes?.name || "N/A"}</div>;
        case "department":
          return <div>{item.ref_departments?.name || "N/A"}</div>;
        case "contact":
          return (
            <div className="flex flex-col items-start">
              <div>{item.email || "N/A"}</div>
              <div>{item.contact_no || "N/A"}</div>
            </div>
          );
        case "hiredate":
          return (
            <div>
              {item.hired_at
                ? new Date(item.hired_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "N/A"}
            </div>
          );
        case "status":
          return <div>{getEmployeeStatus(item)}</div>;
        case "actions":
          return (
            <div className="flex space-x-2">
              <TableActionButton
                name={`${item.first_name} ${item.last_name}`}
                onEdit={() => handleEdit(item)}
                onDelete={() => {
                  setSelectedEmployeeId(item.id);
                  onOpenDeleteModal();
                }}
              />
              <Button onClick={() => handleStatusAction(item)}>
                Change Status
              </Button>
            </div>
          );
        default:
          return <></>;
      }
    },
  };

  const searchingItemKey: (keyof Employee)[] = [
    "first_name",
    "last_name",
    "email",
    "contact_no",
  ];

  return (
    <div id="employee-page" className="mt-2">
      <TableData
        aria-label="Employee Table"
        config={config}
        items={employees || []}
        searchingItemKey={searchingItemKey}
        counterName="Employees"
        isLoading={loading}
        isHeaderSticky={true}
        classNames={{
          wrapper: "h-[27rem] overflow-y-auto",
        }}
        contentTop={
          <div className="flex items-center justify-between">
            <div className="ml-4">
              <AddEmployee onEmployeeAdded={handleEmployeeUpdated} />
            </div>
            <div className="ml-auto mr-4"></div>
          </div>
        }
      />

      <EmployeeModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        employee={selectedEmployee}
        onEmployeeUpdated={handleEmployeeUpdated}
      />

      {selectedEmployeeId !== null && (
        <EditEmployee
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          employeeId={selectedEmployeeId}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}

      <Modal size="xs" isOpen={isDeleteModalOpen} onClose={onCloseDeleteModal}>
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete this employee? This action
              cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={onCloseDeleteModal}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleDelete}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Page