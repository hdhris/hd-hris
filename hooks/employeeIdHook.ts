import {getEmployeeId} from "@/server/getEmployeeId";
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";


export function useEmployeeId() {
    const [id, setId] = useState<number | null>(null)
    const {data} = useSession()

    useEffect(() => {
       if(data) {
           setId(Number(data.user?.id))
       }
    }, [data])

    return id
}