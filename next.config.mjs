/** @type {import('next').NextConfig} */
const nextConfig = {
    env:{
        APP_NAME: process.env.APP_NAME,
        DEBUG: process.env.DEBUG,
    }
};

export default nextConfig;
