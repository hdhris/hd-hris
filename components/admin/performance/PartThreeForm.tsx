import BulletedTextArea from "@/components/common/BulletedTextArea";
import Typography from "@/components/common/typography/Typography";
import { toast } from "@/components/ui/use-toast";
import { asyncQueue } from "@/hooks/asyncQueue";
import { Card } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

const defaultValues = [
    {
        id: 1,
        label: "List competencies here improvement is desired.",
        value: "",
    },
    {
        id: 2,
        label: "Developmental activities that will be used to enhance competency.",
        value: "",
    },
    {
        id: 3,
        label: "Expected outcomes or improvement you wish to see (Should relate to achievement of goals). Indicate expected date of completion.",
        value: "",
    },
];

function PartThreeForm({
    id,
    predefinedDevPlan = [],
}: {
    id: number;
    predefinedDevPlan: {
        id: number;
        label: string;
        value: string;
    }[];
}) {
    const [values, setValue] = useState<
        {
            id: number;
            label: string;
            value: string;
        }[]
    >(predefinedDevPlan);

    useEffect(()=>{
        if(predefinedDevPlan.length === 0){
            setValue(defaultValues)
        }
    },[predefinedDevPlan])

    const handleChange = (id: number, value: string) => {
        setValue((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          value: value,
                      }
                    : item
            )
        );
    };

    const { pushToQueue } = asyncQueue<typeof predefinedDevPlan>(async (value?: typeof predefinedDevPlan) => {
        try {
            await axios.post("/api/admin/performance/employees/update/part_3", {
                id: id,
                development_plan_json: value,
            });
        } catch (error) {
            toast({
                description: "An error has occured on saving changes",
                variant: "danger",
            });
        }
    });

    useEffect(() => {
        pushToQueue(values);
    }, [values]);

    return (
        <div className="space-y-4">
            {values.map((item) => (
                <Card shadow="sm" className="border p-8">
                    <Typography className="mb-2">{item.label}</Typography>
                    <BulletedTextArea value={item.value} onValueChange={(value) => handleChange(item.id, value)} />
                </Card>
            ))}
        </div>
    );
}

export default PartThreeForm;
