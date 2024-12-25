"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Radio, RadioGroup } from "@nextui-org/react";
import { CriteriaDetail, Rating, TableRating } from "@/types/performance/types";
import Typography from "@/components/common/typography/Typography";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { isObjectEmpty } from "@/helper/objects/filterObject";

interface SurveyFormProps {
    criteriaDetails: CriteriaDetail[];
    predefinedResponses?: Record<number, { total: number; details: Record<number, number> }>; // Optional pre-filled data
}

export default function SurveyForm({ criteriaDetails, predefinedResponses = {} }: SurveyFormProps) {
    const [responses, setResponses] =
        useState<Record<number, { total: number; details: Record<number, number> }>>(predefinedResponses);

    // Initialize responses properly from predefined data if available
    useEffect(() => {
        if (predefinedResponses && !isObjectEmpty(predefinedResponses)) {
            Object.keys(predefinedResponses).forEach((criteriaID) => {
                const { total, details } = predefinedResponses[parseInt(criteriaID)];
                handleResponseChange(parseInt(criteriaID), total, details);
            });
        }
    }, [predefinedResponses]);

    const handleResponseChange = (criteriaID: number, value: number, details: Record<number, number>) => {
        setResponses((prev) => ({
            ...prev,
            [criteriaID]: {
                total: value,
                details, // Include nested details if available.
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

    return (
        <div>
            <form id="form" onSubmit={handleSubmit}>
                {criteriaDetails.map((criteriaDetail) => (
                    <Card key={criteriaDetail.id} shadow="sm" className="border p-8 mb-4">
                        <RenderTableChoices
                            id={criteriaDetail.id}
                            name={criteriaDetail.name}
                            description={criteriaDetail.description}
                            ratings={criteriaDetail.ratings_json}
                            type={criteriaDetail.type}
                            weight={criteriaDetail.weight}
                            handleResponseChange={handleResponseChange}
                            predefinedRate={responses[criteriaDetail.id]} // Pass predefined responses
                        />
                    </Card>
                ))}
            </form>
            <Button {...uniformStyle({ radius: "md" })} form="form" type="submit" color="primary" className="ms-auto">
                Submit Survey
            </Button>
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
}: {
    predefinedRate?: { total: number; details?: Record<number, number> } | null;
    id: number;
    name: string;
    description: string;
    weight: number;
    ratings: Rating[] | TableRating[];
    type: "multiple-choices" | "table";
    isChild?: boolean;
    handleResponseChange: (id: number, value: number, details: Record<number, number>) => void;
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
            handleResponseChange(id, totalScore, newDtails);
        };
    }, [predefinedRate]);

    const setRate = (value: number) => {
        const totalScore = value * weight;
        handleResponseChange(id, totalScore, {});
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
                        predefinedValue={predefinedRate?.total ? Math.round(predefinedRate.total / weight) : undefined}
                        ratings={ratings as Rating[]}
                        setRate={setRate}
                    />
                ) : (
                    (ratings as TableRating[]).map((criteria, index) => (
                        <div key={index}>
                            <RenderTableChoices
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
                                          }
                                        : undefined
                                }
                            />
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

const RenderChoices = ({
    setRate,
    ratings,
    predefinedValue,
}: {
    setRate: (value: number) => void;
    predefinedValue?: number;
    ratings: Rating[];
}) => (
    <RadioGroup
        orientation="vertical"
        onValueChange={(value) => setRate(Number(value))}
        defaultValue={String(predefinedValue)} // Set the initial value
    >
        {ratings.map((rating) => (
            <Radio key={rating.rate} value={rating.rate.toString()}>
                {rating.description}
            </Radio>
        ))}
    </RadioGroup>
);
