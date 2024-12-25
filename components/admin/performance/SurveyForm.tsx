"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Spacer, Radio, Button, RadioGroup, CardFooter } from "@nextui-org/react";
import { CriteriaDetail, Rating, TableRating } from "@/types/performance/types";
import Typography from "@/components/common/typography/Typography";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";

interface SurveyFormProps {
    criteriaDetails: CriteriaDetail[];
}

export default function SurveyForm({ criteriaDetails }: SurveyFormProps) {
    const [responses, setResponses] = useState<Record<number, number>>({});

    const handleResponseChange = (criteriaID: number, value: number) => {
        setResponses((prev) => ({ ...prev, [criteriaID]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
        console.log("Survey responses:", responses);
        console.log("Total weighted score:", totalScore);
    };

    return (
        <div className="max-w-[600px] mx-auto">
            <form id="form" onSubmit={handleSubmit}>
                {criteriaDetails.map((criteriaDetail, index) => (
                    <Card key={criteriaDetail.id} shadow="none" className="border p-8 mb-4">
                        <RenderTableChoices
                            id={criteriaDetail.id}
                            name={criteriaDetail.name}
                            ratings={criteriaDetail.ratings_json}
                            type={criteriaDetail.type}
                            weight={criteriaDetail.weight}
                            key={criteriaDetail.id}
                            handleResponseChange={handleResponseChange}
                        />
                    </Card>
                ))}
            </form>
            <Button {...uniformStyle({radius: 'md'})} form="form" type="submit" color="primary" className="ms-auto">
                Submit Survey
            </Button>
        </div>
    );
}

const RenderTableChoices = ({
    id,
    name,
    weight,
    type,
    ratings,
    handleResponseChange,
    isChild,
}: {
    id: number;
    name: string;
    weight: number;
    ratings: Rating[] | TableRating[];
    type: "multiple-choices" | "table";
    isChild?: boolean;
    handleResponseChange: (id: number, value: number) => void;
}) => {
    const [currentRate, setCurrentRate] = useState(0);
    const [responses, setResponses] = useState<Record<number, number>>({});

    const handleChildrenResponseChange = (criteriaID: number, value: number) => {
        setResponses((prev) => ({ ...prev, [criteriaID]: value }));
    };

    useEffect(() => {
        const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
        setCurrentRate(totalScore);
        handleResponseChange(id, totalScore);
    }, [responses]);

    const setRate = (value: number) => {
        const totalScore = value * weight;
        setCurrentRate(totalScore);
        handleResponseChange(id, totalScore);
    };

    return (
        <>
            <div className="flex justify-between items-center">
                <Typography className="mb-2">{name}</Typography>
                {!isChild && <p className="text-gray-500 text-sm">{currentRate} / {5}</p>}
            </div>
            <div className="ms-4 space-y-4">
                {type === "multiple-choices" ? (
                    <RenderChoices weight={weight} ratings={ratings as Rating[]} setRate={setRate} />
                ) : (
                    (ratings as TableRating[]).map((criteria, index) => {
                        return (
                            <div key={index}>
                                <RenderTableChoices
                                    id={index}
                                    isChild
                                    name={criteria.name}
                                    type={criteria.type}
                                    weight={criteria.weight}
                                    ratings={criteria.ratings}
                                    handleResponseChange={handleChildrenResponseChange}
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
};

const RenderChoices = ({
    setRate,
    ratings,
}: {
    setRate: (value: number) => void;
    weight: number;
    ratings: Rating[];
}) => (
    <RadioGroup orientation="vertical" onValueChange={(value) => setRate(Number(value))}>
        {(ratings as any as Rating[]).map((rating) => (
            <Radio key={rating.rate} value={rating.rate.toString()} size="sm">
                {rating.description}
            </Radio>
        ))}
    </RadioGroup>
);
