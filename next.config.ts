import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "34.68.198.15",
                pathname: "/**",
            },
        ],
    },
};

export default withNextIntl(nextConfig);
