import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Avatar,
  Spinner,
} from "@nextui-org/react";
import { AffectedEmployee, PayheadAffected } from "@/types/payroll/payrollType";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BorderedSwitch from "@/components/common/BorderedSwitch";
import TableData from "@/components/tabledata/TableData";

interface PayheadFormProps {
  label: string;
  onSubmit: (values: any) => void;
  type: "earning" | "deduction";
  allData: { data: PayheadAffected; isLoading: boolean };
  selectedKeys: string[];
  setSelectedKeys: (keys: string[]) => void;
}

export const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(20, { message: "Character limit reached." }),
  calculation: z.string(),
  is_mandatory: z.boolean(),
  is_active: z.boolean(),
});

export const PayheadForm: React.FC<PayheadFormProps> = ({
  label,
  type,
  onSubmit,
  allData,
  selectedKeys,
  setSelectedKeys,
}) => {
  const { data, isLoading } = allData || { data: null, isLoading: true }; // Ensure `data` has a fallback
  const [disabledKeys, setDisabledKeys] = useState<any>([]);
  const [isMandatory, setIsMandatory] = useState(false);
  const [isPending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      calculation: "",
      is_mandatory: false,
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

  function handleSelection(keys: any) {
    if (keys === "all") {
      const employeeIds = data?.employees.map((employee) =>
        String(employee.id)
      );
      setSelectedKeys(employeeIds);
    } else {
      const keysArray: string[] = Array.from(keys);
      setSelectedKeys(keysArray);
    }
  }

  function handleMandatory(selected: boolean) {
    setIsMandatory(selected);
    if (selected) {
      const employeeIds = data?.employees.map((employee) =>
        String(employee.id)
      );
      setDisabledKeys(employeeIds);
    } else {
      setDisabledKeys([]);
    }
  }

  async function handleSubmit(value: any){
    setPending(true);
    await onSubmit(value);
    setPending(false);
  }

  const setData = useCallback(() => {
    if (data?.payhead) {
      const employeeIds = data.affected.map((affected) =>
        String(affected.employee_id)
      );
      setSelectedKeys(employeeIds);
      form.reset({
        name: data.payhead.name,
        calculation: data.payhead.calculation,
        is_mandatory: data.payhead.is_mandatory,
        is_active: data.payhead.is_active,
      });
      handleMandatory(data.payhead.is_mandatory);
    }
  }, [data, form]);

  useEffect(() => {
    setData();
  }, [setData]);

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
    <div className="flex flex-row gap-2 pt-2">
      <Card className="h-fit m-2">
        <CardHeader>{label}</CardHeader>
        <CardBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{type} Name</FormLabel>
                    <FormControl>
                      <Input placeholder={`Enter ${type} name`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="calculation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calculation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter mathematical calculation"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_mandatory"
                render={({ field }) => (
                  <FormItem className="flex flex-row-reverse items-center justify-between">
                    <FormControl>
                      <BorderedSwitch
                        label="Mandatory"
                        description={`Apply ${type} to every employee`}
                        isSelected={field.value}
                        onValueChange={field.onChange}
                        onChange={handleMandatory}
                        color="success"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row-reverse items-center justify-between">
                    <FormControl>
                      <BorderedSwitch
                        label="is Active"
                        description="Effective on next payroll process."
                        isSelected={field.value}
                        onValueChange={field.onChange}
                        color="success"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button isLoading={isPending} color="primary" className="w-full" type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </CardBody>
      </Card>
      <div className="w-full">
        <TableData
          config={config}
          items={data.employees!}
          isLoading={isLoading}
          selectedKeys={isMandatory ? [] : selectedKeys}
          disabledKeys={disabledKeys}
          searchingItemKey={["first_name", "middle_name", "last_name"]}
          onSelectionChange={(keys) => handleSelection(keys)}
          counterName="Employees"
          className="flex-1 h-[calc(100vh-9.5rem)] overflow-y-auto w-full"
          removeWrapper
          isHeaderSticky
          color={"primary"}
          selectionMode={isMandatory ? "single" : "multiple"}
          aria-label="Employees"
        />
      </div>
    </div>
  );
};
