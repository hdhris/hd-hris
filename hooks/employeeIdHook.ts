import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";


export function useEmployeeId() {
    const [id, setId] = useState<number>(-1)
    const {data} = useSession()

    useEffect(() => {
        if(data?.user?.employee_id) {
            setId(Number(data.user?.employee_id))
        }
    }, [data])

    return id
}