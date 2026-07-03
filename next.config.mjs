import { withSentryConfig } from "@sentry/nextjs";
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["pdf-parse"],
  // Allow Next.js to process .mdx files as pages/components
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      // Support GitHub Flavored Markdown (tables, strikethrough, etc.)
      remarkGfm,
      // Ignore YAML frontmatter blocks so they aren't rendered as text
      remarkFrontmatter,
    ],
    rehypePlugins: [],
  },
})

export default withSentryConfig(withMDX(nextConfig), {
  org: "ram-qlx",
  project: "invocly",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});