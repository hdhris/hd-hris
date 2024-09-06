import {axiosInstance} from "@/services/fetcher";

export async function get(url: string, data?: any) {
    const response = await axiosInstance.get(url, data);

}