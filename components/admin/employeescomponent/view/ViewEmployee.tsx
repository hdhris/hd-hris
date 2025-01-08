import React, {useEffect, useState} from "react";
import {Chip,} from "@nextui-org/react";
import {FormProvider, useForm} from "react-hook-form";
import {Employee} from "@/types/employeee/EmployeeType";
import EmployeeStatusActions from "./EmployeeStatusActions";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import Typography from "@/components/common/typography/Typography";
import UserMail from "@/components/common/avatar/user-info-mail";
import CardTable from "@/components/common/card-view/card-table";
import CardView from "@/components/common/card-view/card-view";
import dayjs from "dayjs";
import {isEmployeeAvailable} from "@/helper/employee/unavailableEmployee";

interface ViewEmployeeProps {
    employee: Employee;
    onEmployeeUpdated: () => Promise<void>;
    onClose: () => void;
    sortedEmployees: Employee[];
    signatories?: Signatory[] | null;
}


const employeeInfoSchema = z.object({
    gender: z.string(), age: z.string(), birthdate: z.string(), address: z.string(), workingType: z.string(),
});

const statusActionSchema = z.object({
    startDate: z.string().optional(), endDate: z.string().nullable(), reason: z.string().optional(),
});
type Signatory = {
    id: string | number; name: string; picture?: string; role?: string;
};

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
                                                       employee: initialEmployee,
                                                       onEmployeeUpdated,
                                                       onClose,
                                                       sortedEmployees,
                                                       signatories: initialSignatories,
                                                   }) => {
    const [employee, setEmployee] = useState<Employee>(initialEmployee);
    // const [signatories, setSignatories] = useState<{
    //   users: Array<{
    //     id: string | number;
    //     name: string;
    //     picture?: string;
    //     role?: string;
    //   }>;
    // } | null>(initialSignatories ? { users: initialSignatories } : null);

    // useEffect(() => {
    //   const fetchSignatories = async () => {
    //     // Only fetch if no signatories were passed
    //     if (!initialSignatories) {
    //       const path = employee.suspension_json
    //         ? "employee_suspension"
    //         : employee.resignation_json
    //         ? "employee_resignation"
    //         : employee.termination_json
    //         ? "employee_termination"
    //         : null;

    //       if (path) {
    //         const result = await getSignatory(path, employee.id, false);

    //         if (result) {
    //           setSignatories({
    //             users: result.users.map((user) => ({
    //               id: user.id,
    //               name: user.name,
    //               picture: user.picture || undefined,
    //               role: user.role || undefined,
    //             })),
    //           });
    //         }
    //       }
    //     }
    //   };

    //   fetchSignatories();
    // }, [employee, initialSignatories]);

    const infoMethods = useForm<EmployeeInfoFormData>({
        resolver: zodResolver(employeeInfoSchema), defaultValues: {
            gender: "", age: "", birthdate: "", address: "", workingType: "",
        }, mode: "onChange",
    });

    const statusMethods = useForm<StatusActionFormData>({
        resolver: zodResolver(statusActionSchema), defaultValues: {
            startDate: "", endDate: null, reason: "",
        },
    });

    useEffect(() => {
        if (employee?.id) {
            const updatedEmployee = sortedEmployees.find((e) => e.id === employee.id);
            if (updatedEmployee) {
                setEmployee(updatedEmployee);
            }
        }
    }, [sortedEmployees, employee?.id]);

    useEffect(() => {
        if (initialEmployee) {
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
                birthdate: new Date(initialEmployee.birthdate)
                    .toISOString()
                    .split("T")[0],
                address: `${address.baranggay}, ${address.municipal}, ${address.province}, ${address.region}`,
                workingType: initialEmployee.ref_departments?.name || "N/A",
            });
        }
    }, [initialEmployee, infoMethods]);

    const handleEmployeeUpdated = async () => {
        await onEmployeeUpdated();
    };

    // const isActive =
    //   !employee.suspension_json &&
    //   !employee.resignation_json &&
    //   !employee.termination_json;
    const isActive = isEmployeeAvailable({employee});

    const getStatusColor = (isActive: boolean) => {
        if (isActive) return "success";
        if (!isEmployeeAvailable({employee, find:["suspension"]})) return "warning";
        if (!isEmployeeAvailable({employee, find:["resignation"]})) return "primary";
        if (!isEmployeeAvailable({employee, find:["hired"]})) return "default";
        return "danger";
    };

    return (<CardView
            onClose={onClose}
            header={<div className="flex flex-row items-center justify-between space-x-4 pb-2">
                <UserMail
                    name={<Typography className="font-semibold">
                        {employee?.first_name} {employee?.last_name}
                    </Typography>}
                    picture={employee?.picture || ""}
                    email={employee?.email || "No Email"}
                />
                <Chip size="md" color={getStatusColor(isActive)} variant="dot">
                    {isActive ? "Active" : !isEmployeeAvailable({employee, find:["suspension"]}) ? "Suspended" : !isEmployeeAvailable({employee, find:["resignation"]}) ? "Resigned" : !isEmployeeAvailable({employee, find:["termination"]}) ? "Terminated" : !isEmployeeAvailable({employee, find:["hired"]}) ? "Reserved" : employee.status}
                </Chip>
            </div>}
            body={<div className="max-w-[400px] overflow-y-auto">
                <CardTable

                    data={[{
                        label: "Department", value: employee?.ref_departments?.name || "N/A",
                    }, {
                        label: "Position", value: employee?.ref_job_classes?.name || "N/A",
                    }, {
                        label: "Employment Status", value: employee?.ref_employment_status?.name || "N/A",
                    }, {
                        label: "Hire Date",
                        value: employee?.hired_at ? dayjs(employee?.hired_at).format("YYYY-MM-DD") : "N/A",
                    }, {
                        label: "Contact Number", value: employee?.contact_no ? `+63${employee.contact_no}` : "N/A",
                    }, {
                        label: "Gender", value: employee?.gender === "M" ? "Male" : "Female",
                    }, {
                        label: "Birthdate", value: dayjs(employee?.birthdate).format("YYYY-MM-DD"),
                    }, {
                        label: "Age", value: `${calculateAge(employee?.birthdate)} years old`,
                    }, {
                        label: "Address",
                        value: `${employee?.ref_addresses_trans_employees_addr_baranggayToref_addresses?.address_name || ""}, 
                       ${employee?.ref_addresses_trans_employees_addr_municipalToref_addresses?.address_name || ""}, 
                       ${employee?.ref_addresses_trans_employees_addr_provinceToref_addresses?.address_name || ""}, 
                       ${employee?.ref_addresses_trans_employees_addr_regionToref_addresses?.address_name || ""}`,
                    },]}
                />
                {/* {!isActive &&
            signatories &&
            Array.isArray(signatories.users) &&
            signatories.users.length > 0 && (
              <div className="mt-4">
                <Typography className="text-xs text-gray-600 tracking-wider uppercase font-medium mb-2">
                  {employee.suspension_json
                    ? "Suspension"
                    : employee.resignation_json
                    ? "Resignation"
                    : "Termination"}{" "}
                  Approved By
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {signatories.users.map((signatory) => (
                    <UserAvatarTooltip
                      key={signatory.id}
                      user={{
                        name: signatory.name,
                        picture: signatory.picture,
                        id: signatory.id,
                      }}
                      avatarProps={{
                        classNames: { base: "!size-6" },
                        isBordered: true,
                      }}
                    />
                  ))}
                </div>
              </div>
            )} */}

                <hr className="border border-default-400 space-y-2"/>
            </div>}
            onDanger={<FormProvider {...statusMethods}>
                <EmployeeStatusActions
                    employee={employee}
                    onEmployeeUpdated={handleEmployeeUpdated}
                    onClose={onClose}
                    methods={statusMethods}
                    sortedEmployees={sortedEmployees}

                />
            </FormProvider>}
        />);
};

export default ViewEmployee;
