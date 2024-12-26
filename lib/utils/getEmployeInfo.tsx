import { MajorEmployee } from "@/helper/include-emp-and-reviewr/include";
import { useEffect, useState } from "react";
import { loadFromSession, saveToSession } from "./sessionStorage";
import { useEmployeeId } from "@/hooks/employeeIdHook";

export function useUserInfo(): MajorEmployee | undefined {
  const id = useEmployeeId();
  const cacheKey = `currentUserInfo_key`;
  const [userInfo, setUserInfo] = useState<MajorEmployee | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      // console.log("Found ID: ",id)
      if (id < 1) {
        setUserInfo(undefined);
        return;
      }

      setLoading(true);
      try {
        // Load cached data first
        // console.log("User Id: ", id);
        const cachedData = loadFromSession<MajorEmployee>(cacheKey, String(id));
        if (cachedData) {
          setUserInfo(cachedData);
          return; // Exit if already cached
        }

        // Else, fetch new data
        const response = await fetch(`/api/admin/utils/get-user-info?userID=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }

        const data: MajorEmployee = await response.json();
        if(data){
          setUserInfo(data);
          saveToSession(cacheKey, data, String(id), (60 * 24));
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [id, cacheKey]);

  if (loading) {
    return undefined; // Or return a loading state
  }

  if (error) {
    console.error('Error fetching user info:', error);
    return undefined; // Or handle error state as needed
  }

  return userInfo;
}