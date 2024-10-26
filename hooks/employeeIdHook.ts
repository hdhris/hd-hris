import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import { UserEmployee } from "@/helper/include-emp-and-reviewr/include";
import { useQuery } from "@/services/queries";


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

export function useUserInfo(): UserEmployee | undefined {
    const id = useEmployeeId();
    return useQuery<UserEmployee>(`/api/admin/utils/get-user-info?userID=${id}`).data;
}