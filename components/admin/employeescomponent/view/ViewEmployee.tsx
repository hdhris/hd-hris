import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { useForm, FormProvider } from "react-hook-form";
import { useDisclosure } from "@nextui-org/react";
import Drawer from "@/components/common/Drawer";
import { Employee } from "@/types/employeee/EmployeeType";
import EmployeeInformation from "./EmployeeInformation";
import EmployeeStatusActions from "./EmployeeStatusActions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface ViewEmployeeProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onEmployeeUpdated: () => Promise<void>;
  sortedEmployees: Employee[];
}

const employeeInfoSchema = z.object({
  gender: z.string(),
  age: z.string(),
  birthdate: z.string(),
  address: z.string(),
  workingType: z.string(),
});

const statusActionSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reason: z.string().optional(),
});

type EmployeeInfoFormData = z.infer<typeof employeeInfoSchema>;
type StatusActionFormData = z.infer<typeof statusActionSchema>;

const calculateAge = (birthdate: string): number => {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const ViewEmployee: React.FC<ViewEmployeeProps> = ({
  isOpen,
  onClose,
  employee: initialEmployee,
  onEmployeeUpdated,
  sortedEmployees
}) => {
  const [employee, setEmployee] = useState<Employee>(initialEmployee);
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

  const infoMethods = useForm<EmployeeInfoFormData>({
    resolver: zodResolver(employeeInfoSchema),
    defaultValues: {
      gender: "",
      age: "",
      birthdate: "",
      address: "",
      workingType: "",
    },
    mode: "onChange",
  });

  const statusMethods = useForm<StatusActionFormData>({
    resolver: zodResolver(statusActionSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  // Fixed by adding employee.id to dependencies
  useEffect(() => {
    if (employee?.id) {
      const updatedEmployee = sortedEmployees.find(e => e.id === employee.id);
      if (updatedEmployee) {
        setEmployee(updatedEmployee);
      }
    }
  }, [sortedEmployees, employee?.id]);

  // Fixed by adding onDrawerOpen and onDrawerClose to dependencies
  useEffect(() => {
    if (isOpen) {
      onDrawerOpen();
    } else {
      onDrawerClose();
    }
  }, [isOpen, onDrawerOpen, onDrawerClose]);

  // Fixed by adding infoMethods to dependencies
  useEffect(() => {
    if (isDrawerOpen && initialEmployee) {
      setEmployee(initialEmployee);
      const address = {
        baranggay: initialEmployee?.ref_addresses_trans_employees_addr_baranggayToref_addresses?.address_name,
        municipal: initialEmployee?.ref_addresses_trans_employees_addr_municipalToref_addresses?.address_name,
        province: initialEmployee?.ref_addresses_trans_employees_addr_provinceToref_addresses?.address_name,
        region: initialEmployee?.ref_addresses_trans_employees_addr_regionToref_addresses?.address_name,
      };

      infoMethods.reset({
        gender: initialEmployee.gender === "M" ? "Male" : "Female",
        age: `${calculateAge(initialEmployee.birthdate)} years old`,
        birthdate: new Date(initialEmployee.birthdate).toISOString().split('T')[0],
        address: `${address.baranggay}, ${address.municipal}, ${address.province}, ${address.region}`,
        workingType: initialEmployee.ref_departments?.name || "N/A",
      });
    }
  }, [isDrawerOpen, initialEmployee, infoMethods]);

  const handleEmployeeUpdated = async () => {
    await onEmployeeUpdated();
  };

  const handleClose = () => {
    infoMethods.reset();
    statusMethods.reset();
    onDrawerClose();
    onClose();
  };

  return (
    <Drawer
      title="Employee Information"
      size="md"
      isOpen={isDrawerOpen}
      onClose={handleClose}
    >
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <FormProvider {...infoMethods}>
            <EmployeeInformation 
              employee={employee} 
              methods={infoMethods} 
            />
          </FormProvider>

          <div className="mt-8">
            <FormProvider {...statusMethods}>
              <EmployeeStatusActions
                employee={employee}
                onEmployeeUpdated={handleEmployeeUpdated}
                onClose={handleClose}
                methods={statusMethods}
                sortedEmployees={sortedEmployees}
              />
            </FormProvider>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-2 border-t">
          {/* <Button 
            variant="bordered" 
            onClick={handleClose}
            size="sm"
          >
            Cancel
          </Button>
          <Button 
            color="primary" 
            onClick={handleClose}
            size="sm"
          >
            Close
          </Button> */}
        </div>
      </div>
    </Drawer>
  );
};

export default ViewEmployee;