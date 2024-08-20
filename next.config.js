// next.config.js

module.exports = {
  async redirects() {
    return [
      {
        source: "/admin/attendance-time",
        destination: "/admin/attendance-time/records",
        permanent: true,
      },
    ];
  },
};
