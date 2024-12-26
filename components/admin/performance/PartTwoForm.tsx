"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody, Input, Radio, RadioGroup } from "@nextui-org/react";
import { IoIosClose } from "react-icons/io";
import { Compentencies } from "@/types/performance/types";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { asyncQueue } from "@/hooks/asyncQueue";

export default function CriteriaList({
    id,
    predefinedCompentencies = [],
}: {
    id: number;
    predefinedCompentencies: Compentencies[];
}) {
    const [criteriaList, setCriteriaList] = useState<Compentencies[]>(predefinedCompentencies);
    // const [submittedList, setSubmittedList] = useState<Compentencies[]>([]);

    useEffect(() => {
        if (criteriaList.length === 0) addRow();
    }, [criteriaList]);

    const addRow = () => {
        setCriteriaList([...criteriaList, { id: Date.now(), criteria: "", rating: "", remarks: "" }]);
    };

    const updateCriteria = (id: number, field: keyof Compentencies, value: string) => {
        setCriteriaList(criteriaList.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    };

    const removeRow = (id: number) => {
        setCriteriaList((prev) => prev.filter((item) => item.id != id));
    };

    const { pushToQueue } = asyncQueue<typeof criteriaList>(async (value?: typeof criteriaList) => {
        try {
            await axios.post("/api/admin/performance/employees/update/part_2", {
                id: id,
                compentencies_json: value,
            });
        } catch (error) {
            toast({
                description: "An error has occured on saving changes",
                variant: "danger",
            });
        }
    });

    useEffect(() => {
        pushToQueue(criteriaList.filter((item) => item.criteria != ""));
    }, [criteriaList]);

    // const submitResults = () => {
    //     setSubmittedList(criteriaList);
    //     setCriteriaList([]);
    // };

    return (
        <Card shadow="sm" className="border p-8 mb-4">
            <div className="grid grid-cols-3 gap-4">
                <p>Criteria</p>
                <p>Rating</p>
                <p>Remarks</p>
            </div>
            {criteriaList.map((item) => (
                <div key={item.id} className="grid grid-cols-3 gap-4 mt-4">
                    <Input
                        id={`criteria-${item.id}`}
                        value={item.criteria}
                        onChange={(e) => updateCriteria(item.id, "criteria", e.target.value)}
                        placeholder="Enter criteria"
                    />
                    <RadioGroup
                        value={item.rating}
                        onValueChange={(value) => updateCriteria(item.id, "rating", value)}
                        className="flex"
                        orientation="horizontal"
                        size="sm"
                    >
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <div key={rating} className="flex items-center">
                                <Radio value={rating.toString()} id={`rating-${item.id}-${rating}`} />
                                <p>{rating}</p>
                            </div>
                        ))}
                    </RadioGroup>
                    <div className="flex items-center gap-1">
                        <Input
                            id={`remarks-${item.id}`}
                            value={item.remarks}
                            onValueChange={(value) => updateCriteria(item.id, "remarks", value)}
                            placeholder="Enter remarks"
                        />
                        <Button isIconOnly variant="light" onPress={() => removeRow(item.id)}>
                            <IoIosClose size={30} />
                        </Button>
                    </div>
                </div>
            ))}
            <Button variant="light" className="mx-auto mt-8" onPress={addRow}>
                Add Row
            </Button>
        </Card>
    );
}
