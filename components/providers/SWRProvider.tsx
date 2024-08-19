import React from "react";
import {SWRConfig} from "swr";
import fetcher from "@/services/fetcher";


export default function SWRProvider({children} :{children: React.ReactNode}) {
return <SWRConfig value={{fetcher}}>{children}</SWRConfig>
}