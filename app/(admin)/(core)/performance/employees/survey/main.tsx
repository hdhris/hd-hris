"use client";
import CriteriaList from "@/components/admin/performance/PartTwoForm";
import SurveyForm from "@/components/admin/performance/SurveyForm";
import { useQuery } from "@/services/queries";
import { SurveyFormType, SurveyData } from "@/types/performance/types";
import { Button, Card, ScrollShadow, Spinner } from "@nextui-org/react";
import React, { useMemo, useState } from "react";

const sampleData: SurveyData = {
    "1": { total: 4, details: {}, comments: "" },
    "2": { total: 5, details: { "0": 2, "1": 1.5, "2": 1.5 }, comments: "" },
    "3": { total: 5, details: {}, comments: "" },
    "4": { total: 5, details: {}, comments: "" },
};

function SurveyPage({ id }: { id?: string }) {
    const [page, setPage] = useState(2);
    const { data: survey, isLoading } = useQuery<SurveyFormType>(
        id ? `/api/admin/performance/employees/view?id=${id}` : null
    );

    if (isLoading || !survey?.id) {
        return <Spinner content="Loading..." color="primary" className="w-full h-full" />;
    }

    return (
        <ScrollShadow className="py-4 h-full w-full">
            <div className="mx-auto space-y-8 w-[700px]">
                {page === 1 ? (
                    <>
                        <Card shadow="sm" className="border mb-4 flex flex-col justify-center">
                            <div className="p-8 w-full h-full border-t-8 border-t-danger-500">
                                <h1 className="font-semibold text-center">PERFORMANCE APPRAISAL</h1>
                                <p>ID: {id}</p>
                            </div>
                        </Card>
                        <SurveyForm
                            id={survey?.id}
                            criteriaDetails={survey?.criteria_json || []}
                            predefinedResponses={survey?.ratings_json}
                        />
                    </>
                ) : (
                    page === 2 && (
                        <>
                            <CriteriaList id={survey?.id} predefinedCompentencies={survey.compentencies_json}/>
                        </>
                    )
                )}
                <div className="space-x-2 flex flex-row justify-end">
                    {page!=1 && <Button onPress={()=> setPage(page-1)}>Back</Button>}
                    {page!=2 && <Button color="primary" onPress={()=> setPage(page+1)}>Next</Button>}
                    {page==2 && <Button color="primary">Submit</Button>}
                </div>
            </div>
        </ScrollShadow>
    );
}

export default SurveyPage;
