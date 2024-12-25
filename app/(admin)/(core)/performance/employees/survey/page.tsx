import { awaitSearchParams } from "@/helper/params/searchParam";
import React from "react";
import SurveyPage from "./main";

async function Page({ searchParams }: { searchParams: awaitSearchParams }) {
    const id = (await searchParams).id;

    return <SurveyPage id={String(id)} />;
}

export default Page;
