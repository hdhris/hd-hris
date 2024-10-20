import Drawer from "@/components/common/Drawer";
import FormFields from "@/components/common/forms/FormFields";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { objectExcludes, objectIncludes } from "@/helper/objects/filterObject";
import { toGMT8 } from "@/lib/utils/toGMT8";
import {
  HolidayEvent,
  TransHoliday,
} from "@/types/attendance-time/HolidayTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn, Divider } from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { findByDateAndName, switchLabel } from "./script";

function HolidayForm({
  isOpen,
  onClose,
  selectedItem: data,
  transHolidays,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: HolidayEvent | null;
  transHolidays: TransHoliday[];
}) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<HolidayEvent | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [deleteTrans, setDeleteTrans] = useState<string | null>(null);
  const [transItem, setTransItem] = useState<TransHoliday | null>(null);
  const [defaultTrans, setDefaultTrans] = useState<TransHoliday>();
  const [noWork, setNoWork] = useState(true);
  const [payRatePercent, setPayRatePercent] = useState(0.0);
  const formSchema = z.object({
    id: z.union([z.string(), z.number(), z.null()]).optional(),
    name: z.string().min(1, { message: "Holiday name is required." }),
    type: z.string(),
    date: z.object({
      start: z.string(),
      end: z.string(),
    }),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (transHolidays) {
      setDefaultTrans(
        transHolidays.find((th) => {
          return th.date === null && th.name === selectedItem?.type;
        })
      );

      if (selectedItem) {
        const found = findByDateAndName(transHolidays, selectedItem);
        // console.log("Effect result: ", found)
        setTransItem(found);
        setDeleteTrans("");
      } else {
        setTransItem(null);
      }
    }
  }, [selectedItem, transHolidays]);

  useEffect(() => {
    if (selectedItem) {
      form.reset({
        id: selectedItem.id,
        name: selectedItem.name,
        type: selectedItem.type,
        date: {
          start: selectedItem.start_date,
          end: selectedItem.end_date,
        },
      });
    }
  }, [selectedItem, form]);

  useEffect(() => {
    if (selectedItem) {
      setNoWork(transItem?.no_work || defaultTrans?.no_work || false);
      setPayRatePercent(
        Number(
          transItem?.pay_rate_percentage || defaultTrans?.pay_rate_percentage
        ) || 0
      );
    }
  }, [transItem, defaultTrans, selectedItem]);

  useEffect(() => {
    if (data) {
      setSelectedItem(data);
    } else {
      setSelectedItem({
        id: null,
        name: "New Holiday",
        type: "Private Holiday",
        start_date: toGMT8().format("YYYY-MM-DD"),
        end_date: toGMT8().add(1, "day").format("YYYY-MM-DD"),
      });
    }
  }, [data]);

  async function handleSubmit(value: z.infer<typeof formSchema>) {
    // console.log(value);
    setSubmitting(true);
    try {
      await axios.post("/api/admin/attendance-time/holidays/create", {
        holidayInfo: {
          ...objectIncludes(value, ["name", "id", "type"]),
          start_date: toGMT8(value.date.start).toISOString(),
          end_date: toGMT8(value.date.end).toISOString(),
          created_at: toGMT8().toISOString(),
          updated_at: toGMT8().toISOString(),
        },
        transHolidayInfo: transItem
          ? {
              ...transItem,
              name: value.name,
              date: toGMT8(value.date.start).toISOString(),
              pay_rate_percentage: payRatePercent,
              no_work: noWork,
            }
          : null,
      });
      const isNew = value.id === null;
      toast({
        title: isNew ? "Created" : "Updated",
        description: `Holiday ${isNew ? "created" : "updated"} successfully!`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error creating: " + error,
        variant: "danger",
      });
    }
    setSubmitting(false);
  }

  function newTrans({
    trigger,
    value,
  }: {
    trigger: "noWork" | "pRp";
    value: any;
  }) {
    if (selectedItem) {
      setTransItem({
        id: null,
        name: selectedItem.name,
        date: toGMT8(selectedItem.start_date).toISOString(),
        pay_rate_percentage:
          trigger === "pRp" ? value : defaultTrans?.pay_rate_percentage!,
        no_work: trigger === "noWork" ? value : defaultTrans?.no_work!,
        created_at: "",
        updated_at: "",
      });
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={selectedItem ? "Manage Holiday" : "Create Holiday"}
      isSubmitting={isSubmitting}
    >
      <Form {...form}>
        <form id="drawer-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormFields
            items={[
              {
                name: "name",
                label: "Holiday Name",
                isRequired: true,
                inputDisabled: typeof selectedItem?.id === "string",
              },
              {
                name: "date",
                label: "Date",
                isRequired: true,
                type: "date-range-picker",
                inputDisabled: typeof selectedItem?.id === "string",
              },
              {
                name: "type",
                label: "Type",
                type: "radio-group",
                inputDisabled: typeof selectedItem?.id === "string",
                config: {
                  options: [
                    { label: "Public", value: "Public Holiday" },
                    { label: "Private", value: "Private Holiday" },
                    { label: "Observance", value: "Observance" },
                  ],
                  onValueChange: (value: string) => {
                    if (selectedItem) {
                      setSelectedItem({
                        ...selectedItem,
                        type:
                          value === "Public Holiday"
                            ? "Public Holiday"
                            : value === "Observance"
                            ? "Observance"
                            : "Private Holiday",
                      });
                    }
                  },
                },
              },
              {
                name: "trans_holiday",
                Component(field) {
                  return (
                    <>
                      <Divider className="my-4" />
                      <div className="text-sm text-gray-600 flex gap-2 items-center leading-none">
                        {transItem ? (
                          <>
                            <p className="font-semibold mb-2 text-pink-500">
                              {transItem?.name}
                            </p>
                            <button
                              className="text-tiny !m-0"
                              onClick={() => {
                                if(deleteTrans === "" ){
                                  console.log("will delete");
                                  setDeleteTrans(transItem.name);
                                }
                                setTransItem(null);
                              }}
                            >
                              Unset
                            </button>
                          </>
                        ) : (
                          <>
                            <p
                              className={cn(
                                "font-semibold mb-2",
                                defaultTrans?.name === "Public Holiday"
                                  ? "text-blue-500"
                                  : "text-gray-800"
                              )}
                            >
                              {defaultTrans?.name}
                            </p>
                          </>
                        )}
                      </div>
                    </>
                  );
                },
              },
              {
                name: "no_work",
                label: switchLabel(
                  "No Work",
                  "Attendances will not be recorded during this holiday."
                ),
                type: "switch",
                config: {
                  isSelected: noWork,
                  onValueChange: (value: boolean) => {
                    if (!transItem) {
                      newTrans({ trigger: "noWork", value: value });
                    } else {
                      setNoWork(value);
                    }
                  },
                },
              },
              ...(!noWork
                ? [
                    {
                      name: "pay_rate_percentage",
                      label: "Pay Rate %",
                      placeholder: "0.00",
                      isRequired: true,
                      config: {
                        type: "number",
                        value: payRatePercent,
                        onValueChange: (value: string) => {
                          if (!transItem) {
                            newTrans({ trigger: "pRp", value: Number(value) });
                          } else {
                            setPayRatePercent(Number(value));
                          }
                        },
                      },
                    },
                  ]
                : []),
            ]}
          />
        </form>
      </Form>
    </Drawer>
  );
}

export default HolidayForm;
