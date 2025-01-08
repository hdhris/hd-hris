import { BatchCard } from "@/components/admin/attendance-time/schedule/batchCard";
import QuickModal from "@/components/common/QuickModal";
import { toast } from "@/components/ui/use-toast";
import showDialog from "@/lib/utils/confirmDialog";
import { BatchSchedule } from "@/types/attendance-time/AttendanceTypes";
import { ScrollShadow } from "@nextui-org/react";
import axios from "axios";
import React, { useCallback, useState } from "react";
import { mutate } from "swr";
import { number } from "zod";

interface ScheduleSwapProp {
    isOpen: boolean;
    onClose: () => void;
    schedules: BatchSchedule[];
}
function ScheduleSwap({ isOpen, onClose, schedules }: ScheduleSwapProp) {
    const [selectedBatch, setSelectedBatch] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const toggleSelected = useCallback((id: number) => {
        setSelectedBatch((prevSelected) => {
            let newSelection;

            if (prevSelected.includes(id)) {
                newSelection = prevSelected.filter((item) => item !== id);
            } else {
                newSelection = [...prevSelected, id];
            }
            return newSelection;
        });
    }, []);

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await showDialog({
                title: "Confirm Swap",
                message: `Are you sure you want to swap schedule?`,
                preferredAnswer: "no",
            });
            if (result === "yes") {
                await axios.post("/api/admin/attendance-time/schedule/swap-schedule", selectedBatch);
                mutate("/api/admin/attendance-time/schedule");
                toast({
                    title: "Updated",
                    description: "Schedule swapped successfully!",
                    variant: "success",
                });
                setSelectedBatch([]);
                onClose();
            }
        } catch (error) {
            toast({
                description: String(error),
                variant: "danger",
            });
        }
        setIsLoading(false);
    }, [selectedBatch]);

    return (
        <QuickModal
            title={"Swap Schedule"}
            isOpen={isOpen}
            onClose={() => {
                setSelectedBatch([]);
                onClose();
            }}
            buttons={{
                onClose: {
                    label: "Close",
                },
                onAction: {
                    label: "Swap",
                    isDisabled: selectedBatch.length < 2,
                    onPress: handleSubmit,
                },
            }}
            size="lg"
        >
            <ScrollShadow className="ps-4">
                <div className="flex flex-wrap gap-4 w-fit ms-auto">
                    {schedules.map((item, index) => (
                        <BatchCard
                            key={item.id}
                            item={item}
                            isHovered={false}
                            isSelected={selectedBatch.includes(item.id)}
                            isDisabled={selectedBatch.length >= 2 && !selectedBatch.includes(item.id)}
                            setHoveredBatchId={() => {}}
                            setSelectedBatch={(item) => item?.id && toggleSelected(item.id)}
                            setVisible={() => {}}
                        />
                    ))}
                </div>
            </ScrollShadow>
        </QuickModal>
    );
}

export default ScheduleSwap;
