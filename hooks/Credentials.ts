import {useMemo} from "react";
import {useUser} from "@/services/queries";

export function useCredentials() {
    const { data } = useUser();

    return useMemo(() => {
        return data ? data.provider === "credential" : false;
    }, [data]);
}
