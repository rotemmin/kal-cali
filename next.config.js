/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/complete-profile',
                destination: '/signup/complete-profile',
              },
              {
                source: '/email-signup',
                destination: '/signup/email-signup',
              },
            ];
        },
};

module.exports = nextConfig;
