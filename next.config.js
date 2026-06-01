/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: false,
    // The production container build should not be gated on lint/type errors
    // (the project tracks these separately, e.g. ts_errors.txt). Run `npm run lint`
    // and `tsc` in CI/dev instead.
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
            },
        ],
    },
    async rewrites() {
        // Server-side proxy target for relative "/api/*" calls. Defaults to local
        // dev; inside Docker compose set BACKEND_URL=http://backend:8000.
        const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
        ]
    },
}

module.exports = nextConfig
