/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    APP_NAME: process.env.APP_NAME,
    AES_SECRET: process.env.AES_SECRET,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  async redirects() {
    return [
      {
        source: "/attendance-time",
        destination: "/attendance-time/records",
        permanent: true,
      },
      {
        source: "/payroll",
        destination: "/payroll/earnings",
        permanent: true,
      },
      {
        source: "/incident",
        destination: "/incident/reports",
        permanent: true,
      },
      {
        source: "/employeemanagement",
        destination: "/employeemanagement/employees",
        permanent: true,
      },{
        source: "/leaves",
        destination: "/leaves/leave-requests",
        permanent: true,
      },{
        source: "/benefits",
        // destination: "/benefits/membership",
        destination: "/benefits/plans",
        permanent: true,
      },{
        source: "/performance",
        destination: "/performance/criteria",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  images: {
    domains: ["files.edgestore.dev"], //
  },
};

export default nextConfig;
