import axios from "axios";

// Create axios instance with baseURL set to API_URL from .env file
export const axiosInstance = axios.create({
    baseURL: process.env.BASE_URL
});
// axios.defaults.baseURL = process.env.API_URL;

// axios.get("/admin/dashboard").then((res) => console.log(res.data));
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);


export default fetcher;