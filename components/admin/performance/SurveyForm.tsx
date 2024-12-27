"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Button, Radio, RadioGroup, Textarea } from "@nextui-org/react";
import { CriteriaDetail, Rating, TableRating } from "@/types/performance/types";
import Typography from "@/components/common/typography/Typography";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { isObjectEmpty } from "@/helper/objects/filterObject";
import { asyncQueue } from "@/hooks/asyncQueue";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { ApprovalStatusType } from "@/types/attendance-time/OvertimeType";
import { SurverContainer } from "@/app/(admin)/(core)/performance/employees/survey/main";

interface SurveyFormProps {
    id: number;
    criteriaDetails: CriteriaDetail[];
    isUneditable: boolean;
    predefinedResponses?: Record<number, { total: number; details: Record<number, number>; comments: string }>; // Optional pre-filled data
}

export default function SurveyForm({ id, criteriaDetails, isUneditable, predefinedResponses = {} }: SurveyFormProps) {
    const [responses, setResponses] =
        useState<Record<number, { total: number; details: Record<number, number>; comments: string }>>(
            predefinedResponses
        );

    // Initialize responses properly from predefined data if available
    useEffect(() => {
        if (predefinedResponses && !isObjectEmpty(predefinedResponses)) {
            Object.keys(predefinedResponses).forEach((criteriaID) => {
                const { total, details, comments } = predefinedResponses[parseInt(criteriaID)];
                handleResponseChange(parseInt(criteriaID), total, details, comments);
            });
        }
    }, [predefinedResponses]);

    const handleResponseChange = (
        criteriaID: number,
        value: number,
        details: Record<number, number>,
        comments: string
    ) => {
        setResponses((prev) => ({
            ...prev,
            [criteriaID]: {
                total: value,
                details, // Include nested details if available.
                comments,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalScore = Object.values(responses).reduce((sum, res) => sum + res.total, 0);
        console.log("Survey responses:", JSON.stringify(responses));
        console.log("Total weighted score:", totalScore);
        console.log("Total items:", criteriaDetails.length);
        console.log("Total overall scroe:", totalScore / criteriaDetails.length);
    };

    const { pushToQueue } = asyncQueue<typeof responses>(async (value?: typeof responses) => {
        try {
            await axios.post("/api/admin/performance/employees/update/part_1", {
                id: id,
                ratings_json: value,
            });
        } catch (error) {
            toast({
                description: "An error has occured on saving changes",
                variant: "danger",
            });
        }
    });

    useEffect(() => {
        if (!isObjectEmpty(responses)) {
            pushToQueue(responses);
        }
    }, [responses]);

    return (
        <div>
            <form id="form" onSubmit={handleSubmit}>
                {criteriaDetails.map((criteriaDetail) => (
                    <SurverContainer key={criteriaDetail.id}>
                        <RenderTableChoices
                            isUneditable={isUneditable}
                            id={criteriaDetail.id}
                            name={criteriaDetail.name}
                            description={criteriaDetail.description}
                            ratings={criteriaDetail.ratings_json}
                            type={criteriaDetail.type}
                            weight={criteriaDetail.weight}
                            handleResponseChange={handleResponseChange}
                            predefinedRate={responses[criteriaDetail.id]} // Pass predefined responses
                        />
                    </SurverContainer>
                ))}
            </form>
            {/* <Button {...uniformStyle({ radius: "md" })} form="form" type="submit" color="primary" className="ms-auto">
                Submit Survey
            </Button> */}
        </div>
    );
}

const RenderTableChoices = ({
    id,
    name,
    description,
    weight,
    type,
    ratings,
    handleResponseChange,
    isChild,
    predefinedRate,
    isUneditable,
}: {
    isUneditable: boolean;
    predefinedRate?: { total: number; details?: Record<number, number>; comments: string } | null;
    id: number;
    name: string;
    description: string;
    weight: number;
    ratings: Rating[] | TableRating[];
    type: "multiple-choices" | "table";
    isChild?: boolean;
    handleResponseChange: (id: number, value: number, details: Record<number, number>, comments: string) => void;
}) => {
    const handleChildResponseChange = useMemo(() => {
        return (criteriaID: number, value: number) => {
            // setChildResponses((prev) => ({ ...prev, [criteriaID]: value }));
            const oldDetails = predefinedRate?.details || {};
            const newDtails = {
                ...oldDetails,
                [criteriaID]: value,
            };
            const totalScore = Object.values(newDtails).reduce((sum, score) => sum + score, 0);
            handleResponseChange(id, totalScore, newDtails, "");
        };
    }, [predefinedRate, handleResponseChange, id]);

    const setRate = (value: number) => {
        const totalScore = value * weight;
        handleResponseChange(id, totalScore, {}, predefinedRate?.comments ?? "");
    };

    const setComment = (value: string) => {
        const oldTotal = predefinedRate?.total ?? 0;
        const oldDetails = predefinedRate?.details || {};
        handleResponseChange(id, oldTotal, oldDetails, value);
    };

    return (
        <>
            <div className="flex justify-between items-center">
                <Typography className="mb-2">{name}</Typography>
                {!isChild && (
                    <p className="text-gray-500 text-sm">
                        {predefinedRate?.total ?? 0} / {5}
                    </p>
                )}
            </div>
            <p className="text-gray-500 text-sm mb-2">{description}</p>
            <div className="ms-4 space-y-4">
                {type === "multiple-choices" ? (
                    <RenderChoices
                        isUneditable={isUneditable}
                        predefinedValue={predefinedRate?.total ? Math.round(predefinedRate.total / weight) : undefined}
                        ratings={ratings as Rating[]}
                        setRate={setRate}
                    />
                ) : (
                    (ratings as TableRating[]).map((criteria, index) => (
                        <div key={index}>
                            <RenderTableChoices
                                isUneditable={isUneditable}
                                id={index}
                                isChild
                                description=""
                                name={criteria.name}
                                type={criteria.type}
                                weight={criteria.weight}
                                ratings={criteria.ratings}
                                handleResponseChange={handleChildResponseChange} // Propagate nested responses
                                predefinedRate={
                                    predefinedRate?.details
                                        ? {
                                              total: predefinedRate.details[index],
                                              comments: "",
                                          }
                                        : undefined
                                }
                            />
                        </div>
                    ))
                )}
            </div>
            {!isChild && (
                <Textarea
                    isDisabled={isUneditable}
                    className="mt-2"
                    placeholder="Comments"
                    value={predefinedRate?.comments}
                    onValueChange={setComment}
                />
            )}
        </>
    );
};

const RenderChoices = ({
    setRate,
    ratings,
    predefinedValue,
    isUneditable,
}: {
    isUneditable: boolean;
    setRate: (value: number) => void;
    predefinedValue?: number;
    ratings: Rating[];
}) => (
    <RadioGroup
        isDisabled={isUneditable}
        orientation="vertical"
        onValueChange={(value) => {
            setRate(Number(value));
        }}
        defaultValue={String(predefinedValue)} // Set the initial value
    >
        {ratings.map((rating) => (
            <Radio key={rating.rate} value={rating.rate.toString()}>
                {rating.description}
            </Radio>
        ))}
    </RadioGroup>
);
