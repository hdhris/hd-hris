import axios, { AxiosResponse } from "axios";
import { axiosInstance } from "@/services/fetcher";
import { useEffect, useState, useRef } from "react";

export function useAxiosGet<T>(initialApi: string, refreshInterval?: number) {
  const [api, setApi] = useState<string>(initialApi);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async (api: string, shouldSetLoading: boolean) => {
    if (shouldSetLoading) {
      setIsLoading(true);
    }
    try {
      const response: AxiosResponse<T> = await axios.get(api);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData(null);
    } finally {
      if (shouldSetLoading) {
        setIsLoading(false);
      }

      // Reset the interval after fetching completes
      if (refreshInterval) {
        if (intervalId.current) {
          clearTimeout(intervalId.current); // Clear any existing interval
        }
        // Start the interval again after the fetch completes
        intervalId.current = setTimeout(() => {
          fetchData(api, false); // Fetch without setting isLoading
        }, refreshInterval);
      }
    }
  };

  useEffect(() => {
    // Fetch data when API changes or on initial load
    fetchData(api, true);

    // Cleanup on component unmount
    return () => {
      if (intervalId.current) {
        clearTimeout(intervalId.current);
      }
    };
  }, [api]);

  return { data, isLoading, setApi };
}



export async function axiosPost(api: string, data: object) {
    await axios.post(api, data);
}
