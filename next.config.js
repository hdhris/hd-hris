// next.config.js

module.exports = {
  async redirects() {
    return [
      {
        source: "/attendance-time",
        destination: "/attendance-time/records",
        permanent: true,
      },  
      {
        source: "/employeemanagement",
        destination: "/employeemanagement/employees",
        permanent: true,
      },
    ];
  },
};
