"use client";
import SurveyForm from "@/components/admin/performance/SurveyForm";
import { useQuery } from "@/services/queries";
import { SurveyFormType, SurveyData } from "@/types/performance/types";
import { Card, ScrollShadow, Spinner } from "@nextui-org/react";
import React, { useMemo } from "react";

const sampleData: SurveyData = {
    "1": { total: 4, details: {} },
    "2": { total: 5, details: { "0": 2, "1": 1.5, "2": 1.5 } },
    "3": { total: 5, details: {} },
    "4": { total: 5, details: {} },
};

function SurveyPage({ id }: { id?: string }) {
    const { data: survey, isLoading } = useQuery<SurveyFormType>(
        id ? `/api/admin/performance/employees/view?id=${id}` : null
    );

    if (isLoading) {
        return <Spinner content="Loading..." color="primary" className="w-full h-full" />;
    }

    return (
        <ScrollShadow className="py-4 h-full w-full">
            <div className="mx-auto space-y-8 max-w-[700px]">
                <Card shadow="sm" className="border mb-4 flex flex-col justify-center">
                    <div className="p-8 w-full h-full border-t-8 border-t-danger-500">
                        <h1 className="font-semibold text-center">PERFORMANCE APPRAISAL</h1>
                        <p>ID: {id}</p>
                    </div>
                </Card>
                <SurveyForm criteriaDetails={survey?.criteria_json || []} predefinedResponses={survey?.ratings_json} />
            </div>
        </ScrollShadow>
    );
}

export default SurveyPage;
