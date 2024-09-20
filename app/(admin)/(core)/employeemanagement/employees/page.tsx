"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import TableData from "@/components/tabledata/TableData";
import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { toast } from "@/components/ui/use-toast";
import { useEmployeesData } from "@/services/queries";
import AddEmployee from "@/components/admin/add/AddEmployees";
import EditEmployee from "@/components/admin/edit/EditEmployee";
import { Employee } from "@/types/employeee/EmployeeType";

const Page: React.FC = () => {
  const { data: employees, mutate, error } = useEmployeesData();
  const [loading, setLoading] = useState(true);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [size, setSize] = React.useState("md");

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

  const handleEdit = async (employee: Employee) => {
    try {
      setSelectedEmployeeId(employee.id);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employee details. Please try again.",
        duration: 3000,
      });
    }
  };

  const handleDelete = async () => {
    if (selectedEmployeeId !== null) {
      try {
        await axios.delete(
          `/api/employeemanagement/employees?id=${selectedEmployeeId}`
        );
        setDeleteSuccess(true);
        await mutate(); // Use mutate to refresh data
        onClose(); // Close the confirmation modal
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

  useEffect(() => {
    if (!loading && deleteSuccess) {
      toast({
        title: "Success",
        description: "Employee successfully deleted!",
        duration: 3000,
      });
      setDeleteSuccess(false);
    }
  }, [loading, deleteSuccess]);

  const config: TableConfigProps<Employee> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "position", name: "Position", sortable: false },
      { uid: "department", name: "Department", sortable: false },
      { uid: "contact", name: "Contact", sortable: false },
      // { uid: "hiredate", name: "Hiredate", sortable: false },
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
                {item.suffix && item.suffix.length > 0
                  ? `, ${item.suffix}`
                  : ""}
                {item.suffix && item.extension
                  ? `, ${item.extension}`
                  : item.extension
                  ? ` ${item.extension}`
                  : ""}
              </span>
            </div>
          );

        case "position":
          return (
            <div>
              <div>{item.ref_job_classes?.name || "N/A"}</div>
            </div>
          );

        case "department":
          return (
            <div>
              <div>{item.ref_departments?.name || "N/A"}</div>
            </div>
          );

        case "contact":
          return (
            <div className="flex flex-col items-start">
              <div>{item.email || "N/A"}</div>
              <div>{item.contact_no || "N/A"}</div>
            </div>
          );
          // case "hiredate":
          //   return (
          //     <div>
          //       <div>{item.hired_at || "N/A"}</div>
          //     </div>
          //   );
  
        case "actions":
          return (
            <TableActionButton
              name={`${item.first_name} ${item.last_name}`}
              onEdit={() => handleEdit(item)}
              onDelete={() => {
                setSelectedEmployeeId(item.id);
                onOpen(); // Open the confirmation modal
              }}
            />
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

  // Wrapper function for onEmployeeUpdated
  const handleEmployeeUpdated = async () => {
    try {
      await mutate(); // Ensure mutate resolves to void
    } catch (error) {
      console.error("Error updating employee:", error);
      // Optionally handle the error here
    }
  };

  return (
    <div id="employee-page" className="mt-2">
      <TableData
        aria-label="Employee Table"
        config={config}
        items={employees || []}
        searchingItemKey={searchingItemKey}
        counterName="Employees"
        selectionMode="multiple"
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

      {selectedEmployeeId !== null && (
        <EditEmployee
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          employeeId={selectedEmployeeId}
          onEmployeeUpdated={handleEmployeeUpdated} // Use the wrapper function
        />
      )}

      <Modal size="xs" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Hey!</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete this employee?
              <br />
              This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleDelete}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Page;
