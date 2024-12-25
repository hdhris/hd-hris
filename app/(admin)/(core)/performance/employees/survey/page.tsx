"use client";
import SurveyForm from "@/components/admin/performance/SurveyForm";
import { useQuery } from "@/services/queries";
import { CriteriaDetail } from "@/types/performance/types";
import { ScrollShadow, Spinner } from "@nextui-org/react";
import React from "react";

function Page() {
    const { data: criterias, isLoading, mutate } = useQuery<CriteriaDetail[]>("/api/admin/performance/criteria");
    // const tableCriteriaDetail: CriteriaDetail = {
    //     id: 1,
    //     name: "Project Evaluation",
    //     description: "Assessment based on specific project metrics.",
    //     is_active: true,
    //     created_at: "2024-12-01T08:00:00Z",
    //     updated_at: "2024-12-23T16:00:00Z",
    //     deleted_at: null,
    //     type: "table",
    //     weight: 1,
    //     ratings_json: [
    //         {
    //             name: "Code Quality",
    //             type: "multiple-choices",
    //             weight: 0.5,
    //             ratings: [
    //                 { rate: 5, description: "Exceptionally clean and maintainable code." },
    //                 { rate: 4, description: "Clean code with minor improvements needed." },
    //                 { rate: 3, description: "Average code quality with some issues." },
    //                 { rate: 2, description: "Below average code quality with many issues." },
    //                 { rate: 1, description: "Poorly written and unmaintainable code." },
    //             ],
    //         },
    //         {
    //             name: "Documentation",
    //             type: "multiple-choices",
    //             weight: 0.3,
    //             ratings: [
    //                 { rate: 5, description: "Comprehensive and clear documentation." },
    //                 { rate: 4, description: "Good documentation with minor gaps." },
    //                 { rate: 3, description: "Adequate documentation with noticeable gaps." },
    //                 { rate: 2, description: "Minimal documentation provided." },
    //                 { rate: 1, description: "No documentation or incomprehensible." },
    //             ],
    //         },
    //         {
    //             type: "multiple-choices",
    //             name: "Timeliness",
    //             weight: 0.2,
    //             ratings: [
    //                 { rate: 5, description: "Delivered well ahead of schedule." },
    //                 { rate: 4, description: "Delivered on time." },
    //                 { rate: 3, description: "Slightly delayed delivery." },
    //                 { rate: 2, description: "Significantly delayed delivery." },
    //                 { rate: 1, description: "Not delivered." },
    //             ],
    //         },
    //     ],
    // };

    // const multipleChoiceCriteriaDetail: CriteriaDetail = {
    //     id: 2,
    //     name: "Feedback Survey",
    //     description: "Collecting feedback for the recent event.",
    //     is_active: true,
    //     created_at: "2024-12-10T12:00:00Z",
    //     updated_at: "2024-12-23T15:45:00Z",
    //     deleted_at: null,
    //     type: "multiple-choices",
    //     weight: 1,
    //     ratings_json: [
    //         { rate: 5, description: "Extremely satisfied" },
    //         { rate: 4, description: "Very satisfied" },
    //         { rate: 3, description: "Neutral" },
    //         { rate: 2, description: "Dissatisfied" },
    //         { rate: 1, description: "Extremely dissatisfied" },
    //     ],
    // };

    if(isLoading){
        return <Spinner content="Loading..." color="primary" className="w-full h-full" />
    }

    return (
        <ScrollShadow className="mx-auto py-4 space-y-8 h-full w-full">
            <SurveyForm criteriaDetails={criterias || []} />
        </ScrollShadow>
    );
}

export default Page;
