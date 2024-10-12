import {getEmployeeId} from "@/server/getEmployeeId";
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";


export function useEmployeeId() {
    const [id, setId] = useState<number>(-1)
    const {data} = useSession()

    useEffect(() => {
       if(data?.user?.id) {
           setId(Number(data.user?.id))
       }
    }, [data])

    return id
}