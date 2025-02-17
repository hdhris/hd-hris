import axios from "axios";

// Create axios instance with baseURL set to API_URL from .env file
export const axiosInstance = axios.create({
    baseURL: process.env.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);


export default fetcher;
