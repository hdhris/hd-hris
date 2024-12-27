"use client";
import PartThreeForm from "@/components/admin/performance/PartThreeForm";
import CriteriaList from "@/components/admin/performance/PartTwoForm";
import SurveyForm from "@/components/admin/performance/SurveyForm";
import { MinorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { getEmpFullName, getFullAddress } from "@/lib/utils/nameFormatter";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { useQuery } from "@/services/queries";
import { SurveyFormType, SurveyData } from "@/types/performance/types";
import { Button, Card, cn, ScrollShadow, Spinner } from "@nextui-org/react";
import { capitalize } from "lodash";
import React, { useMemo, useState } from "react";

const sampleData: SurveyData = {
    "1": { total: 4, details: {}, comments: "" },
    "2": { total: 5, details: { "0": 2, "1": 1.5, "2": 1.5 }, comments: "" },
    "3": { total: 5, details: {}, comments: "" },
    "4": { total: 5, details: {}, comments: "" },
};

function SurveyPage({ id }: { id?: string }) {
    const [page, setPage] = useState(1);
    const { data: survey, isLoading } = useQuery<SurveyFormType>(
        id ? `/api/admin/performance/employees/view?id=${id}` : null
    );

    const isUneditable = useMemo(() => {
        return survey?.status != null;
    }, [survey]);

    if (isLoading || !survey?.id) {
        return <Spinner content="Loading..." color="primary" className="w-full h-full" />;
    }

    const employeeDetails = (employee: MinorEmployee, detail_name: string) => {
        return (
            <div className="mt-4">
                <p className="text-center text-sm">{detail_name}</p>
                <p className="text-center font-semibold">{getEmpFullName(employee)}</p>
                <p className="text-center text-gray-500">{employee.ref_job_classes.name}</p>
            </div>
        );
    };

    return (
        <ScrollShadow className="py-4 h-full w-full">
            <div className="mx-auto space-y-8 w-[700px]">
                {page === 1 ? (
                    <>
                        <Card shadow="sm" className="border mb-4 flex flex-col justify-center">
                            <div className="text-center p-8 w-full h-full border-t-8 border-t-danger-500">
                                <h1 className="font-semibold text-center text-xl">PERFORMANCE APPRAISAL SYSTEM</h1>
                                <p>
                                    {capitalize(survey.phase)} Evaluation for{" "}
                                    {survey.trans_employees.ref_job_classes.name}
                                </p>
                                <p className="text-center text-sm">
                                    {toGMT8(survey.start_date).format("MMMM DD, YYYY")} to{"  "}
                                    {toGMT8(survey.end_date).format("MMMM DD, YYYY")}
                                </p>
                                {employeeDetails(survey.trans_employees, "Employee")}
                                {employeeDetails(
                                    survey.trans_employees_fact_performance_evaluations_evaluated_byTotrans_employees,
                                    "Rater"
                                )}
                            </div>
                            <div className="m-4">
                                <p className="text-center font-semibold text-small text-gray-500">
                                    {survey.trans_employees.ref_branches.name} Branch
                                </p>
                                <p className="text-center text-tiny text-gray-500">
                                    {getFullAddress(survey.trans_employees.ref_branches)}
                                </p>
                            </div>
                        </Card>
                        <SurverContainer>
                            <h1 className="font-semibold text-center text-xl">PART 1: ATTITUDE TOWARDS WORK</h1>
                            <table className="table-auto border-collapse border mx-8 my-4 border-gray-300 text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-2"></th>
                                        <th className="border border-gray-300 px-4 py-2 text-small">POINT VALUE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 text-small">EXCELLENT</td>
                                        <td className="border border-gray-300 px-4 py-2 text-small">5</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 text-small">FULLY SATISFACTORY</td>
                                        <td className="border border-gray-300 px-4 py-2 text-small">4</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 text-small">SATISFACTORY</td>
                                        <td className="border border-gray-300 px-4 py-2 text-small">3</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 text-small">NEEDS IMPROVEMENT</td>
                                        <td className="border border-gray-300 px-4 py-2 text-small">2</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-2 text-small">POOR</td>
                                        <td className="border border-gray-300 px-4 py-2 text-small">1</td>
                                    </tr>
                                </tbody>
                            </table>
                        </SurverContainer>
                        <SurveyForm
                            isUneditable={isUneditable}
                            id={survey?.id}
                            criteriaDetails={survey?.criteria_json || []}
                            predefinedResponses={survey?.ratings_json}
                        />
                    </>
                ) : page === 2 ? (
                    <CriteriaList
                        isUneditable={isUneditable}
                        id={survey?.id}
                        predefinedCompentencies={survey.compentencies_json}
                    />
                ) : page === 3 ? (
                    <PartThreeForm
                        isUneditable={isUneditable}
                        id={survey?.id}
                        predefinedDevPlan={survey.development_plan_json}
                    />
                ) : (
                    <div />
                )}
                <div className="space-x-2 flex flex-row justify-end">
                    {page != 1 && <Button onPress={() => setPage(page - 1)}>Back</Button>}
                    {page != 3 && (
                        <Button color="primary" onPress={() => setPage(page + 1)}>
                            Next
                        </Button>
                    )}
                    {page === 3 && <Button color="primary">Submit</Button>}
                </div>
            </div>
        </ScrollShadow>
    );
}

export default SurveyPage;

export const SurverContainer = ({
    children,
    className: classes,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <Card shadow="sm" className={cn("border p-8 mb-4", classes ?? "")}>
            {children}
        </Card>
    );
};
