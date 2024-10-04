import { Form } from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Avatar,
  Spinner,
  Selection,
  CardFooter,
  ScrollShadow,
} from "@nextui-org/react";
import {
  AffectedEmployee,
  AffectedJson,
  PayheadAffected,
} from "@/types/payroll/payrollType";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { string, z } from "zod";
import TableData from "@/components/tabledata/TableData";
import { ChevronRightIcon } from "lucide-react";
import { ListDropDown } from "./ListBoxDropDown";
import showDialog from "@/lib/utils/confirmDialog";
import { toast } from "@/components/ui/use-toast";
import BorderedSwitch from "@/components/common/BorderedSwitch";
import FormFields from "@/components/common/forms/FormFields";

interface PayheadFormProps {
  label: string;
  onSubmit: (values: any, employees: number[], affected: AffectedJson) => void;
  type: "earning" | "deduction";
  allData: { data: PayheadAffected; isLoading: boolean };
}

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(20, { message: "Character limit reached." }),
  calculation: z.string(),
  is_active: z.boolean(),
});

export const PayheadForm: React.FC<PayheadFormProps> = ({
  label,
  onSubmit,
  allData,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<Selection>(
    new Set([])
  );
  const [selectedJobs, setSelectedJobs] = useState<Selection>(new Set([]));
  const [selectedEmployees, setSelectedEmployees] = useState<Selection>(
    new Set([])
  );
  const { data, isLoading } = allData || { data: null, isLoading: true }; // Ensure `data` has a fallback
  const [disabledKeys, setDisabledKeys] = useState<any>([]);
  const [mandatory, setMandatory] = useState({
    probationary: false,
    regular: false,
  });
  const [isFiltered, setIsFiltered] = useState(false);
  const [isPending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      calculation: "",
      is_active: true,
    },
  });

  const config: TableConfigProps<AffectedEmployee> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "role", name: "Role", sortable: true },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <div className="flex items-center space-x-2">
              <Avatar src={item.picture} />
              <p className="capitalize">{`${item.first_name} ${item.middle_name} ${item.last_name}`}</p>
            </div>
          );
        case "role":
          return (
            <div>
              <p>{item.ref_job_classes ? item.ref_job_classes.name : "None"}</p>
              <p className=" text-gray-500">
                {item.ref_departments ? item.ref_departments.name : "None"}
              </p>
            </div>
          );
        default:
          return <></>;
      }
    },
  };

  async function handleSubmit(value: any) {
    if (!isFiltered && Array.from(selectedEmployees).length === 0) {
      toast({
        title: "Employee Selection",
        description:
          "Payhead is not mandatory to any status.\n\nSelecting an employee(s) is required.",
        variant: "warning",
      });
      return;
    }
    if (Array.from(selectedDepartment).length === 0) {
      const response = await showDialog(
        "Department Selection",
        "No department is selected. The payhead will be applied to all departments automatically.\n\nWould you like to proceed?"
      );
      if (response === "no") {
        return;
      }
    }
    if (Array.from(selectedJobs).length === 0) {
      const response = await showDialog(
        "Role Selection",
        "No role is selected. The payhead will be applied to all roles automatically.\n\nWould you like to proceed?"
      );
      if (response === "no") {
        return;
      }
    }
    setPending(true);
    await onSubmit(
      value,
      isFiltered
        ? []
        : selectedEmployees === "all"
        ? data.employees.map((employee) => employee.id)
        : Array.from(selectedEmployees).map(Number),
      {
        mandatory: mandatory,
        department:
          Array.from(selectedDepartment).length != data.departments.length
            ? Array.from(selectedDepartment).map(Number)
            : [],
        job_classes:
          Array.from(selectedJobs).length != data.job_classes.length
            ? Array.from(selectedJobs).map(Number)
            : [],
      }
    );
    setPending(false);
  }

  const setDataAtLoad = useCallback(() => {
    console.log("Flag: setDataAtLoad");
    if (data?.payhead) {
      const employeeIds = data.affected.map((affected) =>
        String(affected.employee_id)
      );
      setSelectedEmployees(new Set(employeeIds));
      form.reset({
        name: data.payhead.name,
        calculation: data.payhead.calculation,
        is_active: data.payhead.is_active,
      });
      if (data.payhead.affected_json) {
        setMandatory(data.payhead.affected_json.mandatory);
        if (data.payhead.affected_json.department.length > 0) {
          setSelectedDepartment(
            new Set(data.payhead.affected_json.department.map(String))
          );
        } else {
          setSelectedDepartment(
            new Set(
              data?.departments.map((department) => String(department.id))
            )
          );
        }
        if (data.payhead.affected_json.job_classes.length > 0) {
          setSelectedJobs(
            new Set(data.payhead.affected_json.job_classes.map(String))
          );
        } else {
          setSelectedJobs(
            new Set(data.job_classes.map((job) => String(job.id)))
          );
        }
      }
    } else {
      setSelectedDepartment(
        new Set(data?.departments.map((department) => String(department.id)))
      );
      setSelectedJobs(new Set(data.job_classes.map((job) => String(job.id))));
    }
  }, [data, form.reset]);

  useEffect(() => {
    if (data) setDataAtLoad();
  }, [data]);

  const validateMandatory = (value: {
    probationary: boolean;
    regular: boolean;
  }) => {
    return (
      (value.probationary === true && value.regular === false) ||
      (value.probationary === false && value.regular === true) ||
      (value.probationary === true && value.regular === true)
    );
  };

  const filteredDeptAndJobsOrIsMandatory = useCallback(() => {
    if (selectedDepartment && selectedJobs && data) {
      if (
        Array.from(selectedDepartment).length != data.departments.length ||
        Array.from(selectedJobs).length != data.job_classes.length ||
        validateMandatory(mandatory)
      ) {
        console.log("Filtered");
        setIsFiltered(true);
        const employeeIds = data?.employees.map((employee) =>
          String(employee.id)
        );
        setDisabledKeys(employeeIds);
      } else {
        console.log("Unfiltered");
        setDisabledKeys([]);
        setIsFiltered(false);
      }
    }
  }, [selectedDepartment, selectedJobs, mandatory, data, validateMandatory]);

  useEffect(() => {
    filteredDeptAndJobsOrIsMandatory();
  }, [selectedDepartment, selectedJobs, mandatory]);

  if (isLoading || !data) {
    return (
      <Spinner
        className="w-full h-[calc(100vh-9.5rem)]"
        label="Please wait..."
        color="primary"
      />
    );
  }

  return (
    <div className="flex flex-row gap-2 pb-2">
      <Card className="h-fit mx-2 h-fit-navlayout min-w-80 shadow-sm">
        <CardHeader>{label}</CardHeader>
        <CardBody className="pt-0">
          <ScrollShadow>
            <Form {...form}>
              <form
                id="payhead-form"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <div className="space-y-4">
                  <FormFields
                    items={[
                      {
                        name: "name",
                        label: "Name",
                        isRequired: true,
                      },
                      {
                        name: "calculation",
                        label: "Calculation",
                        isRequired: true,
                      },
                      {
                        name: "is_active",
                        Component: (field) => {
                          return (
                            <BorderedSwitch
                              label="Active"
                              description="Effective on next Payroll"
                              isSelected={field.value}
                              onValueChange={field.onChange}
                            />
                          );
                        },
                      },
                    ]}
                  />
                  <ListDropDown
                    items={[
                      { name: "Probationary", id: 1 },
                      { name: "Regular", id: 2 },
                    ]}
                    triggerName="Mandatory Status"
                    selectedKeys={
                      new Set(
                        [
                          mandatory?.probationary ? "1" : undefined,
                          mandatory?.regular ? "2" : undefined,
                        ].filter((key): key is string => key !== undefined)
                      )
                    }
                    onSelectionChange={(keys) => {
                      const values = Array.from(keys);
                      setMandatory({
                        probationary: values.includes("1"),
                        regular: values.includes("2"),
                      });
                    }}
                    togglable={true}
                    reversable={true}
                  />
                  <ListDropDown
                    items={data.departments || []}
                    triggerName="Departments"
                    selectedKeys={selectedDepartment}
                    onSelectionChange={(keys) => {
                      setSelectedDepartment(keys);
                      setSelectedJobs(
                        new Set(
                          data.job_classes
                            .filter((job) =>
                              Array.from(keys).includes(
                                String(job.department_id)
                              )
                            )
                            .map((job) => String(job.id))
                        )
                      );
                    }}
                    togglable={true}
                    reversable={true}
                  />
                  <ListDropDown
                    items={
                      data.job_classes.filter((job) => {
                        return Array.from(selectedDepartment).includes(
                          String(job.department_id)
                        );
                      }) || []
                    }
                    triggerName="Roles"
                    selectedKeys={selectedJobs}
                    onSelectionChange={setSelectedJobs}
                    togglable={true}
                    reversable={true}
                    sectionConfig={data.departments
                      .map((dep) => {
                        return {
                          name: dep.name,
                          key: "department_id",
                          id: dep.id,
                        };
                      })
                      .filter((dep) => {
                        return Array.from(selectedDepartment).includes(
                          String(dep.id)
                        );
                      })}
                  />
                </div>
              </form>
            </Form>
          </ScrollShadow>
        </CardBody>
        <CardFooter>
          <Button
            isLoading={isPending}
            color="primary"
            className="w-full"
            type="submit"
            form="payhead-form"
          >
            Submit
          </Button>
        </CardFooter>
      </Card>
      <div className="w-full h-fit-navlayout">
        <TableData
          config={config}
          items={data.employees || []}
          isLoading={isLoading}
          selectedKeys={isFiltered ? new Set([]) : selectedEmployees}
          disabledKeys={disabledKeys}
          searchingItemKey={["first_name", "middle_name", "last_name"]}
          onSelectionChange={setSelectedEmployees}
          counterName="Employees"
          className="flex-1 w-full h-full"
          removeWrapper
          isHeaderSticky
          color={"primary"}
          selectionMode={isFiltered ? "single" : "multiple"}
          aria-label="Employees"
          filterItems={
            !isFiltered
              ? [
                  {
                    filtered: data.departments.map((dep) => {
                      return {
                        name: dep.name,
                        uid: "dep_" + dep.id,
                      };
                    }),
                    category: "Department",
                  },
                  {
                    filtered: data.job_classes.map((job) => {
                      return {
                        name: job.name,
                        uid: "job_" + job.id,
                      };
                    }),
                    category: "Roles",
                  },
                ]
              : undefined
          }
          filterConfig={(keys) => {
            let filteredItems: AffectedEmployee[] = [...data.employees!];

            if (keys !== "all" && keys.size > 0) {
              console.log(Array.from(keys));
              Array.from(keys).forEach((key) => {
                const [uid, value] = (key as string).split("_");
                filteredItems = filteredItems.filter((items) => {
                  if (uid.includes("dep")) {
                    return items.ref_departments.id === Number(value);
                  } else if (uid.includes("job")) {
                    return items.ref_job_classes.id === Number(value);
                  }
                });
              });
            }

            return filteredItems;
          }}
        />
      </div>
    </div>
  );
};
