import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, ClockIcon, ChevronRightIcon } from 'lucide-react'

interface PostFrontmatter {
  title: string
  description: string
  slug: string
  date: string
  keyword: string
  faq?: Array<{ question: string; answer: string }>
}

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 225
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min read`
}

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'app', 'blog', '_posts')
  if (!fs.existsSync(postsDirectory)) return []
  
  const filenames = fs.readdirSync(postsDirectory)
  return filenames
    .filter((filename) => filename.endsWith('.mdx'))
    .map((filename) => ({
      slug: filename.replace('.mdx', ''),
    }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const postsDirectory = path.join(process.cwd(), 'app', 'blog', '_posts')
  const filePath = path.join(postsDirectory, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return {
      title: 'Post Not Found',
    }
  }

  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(fileContent)
  
  return {
    title: `${data.title} | Invocly Blog`,
    description: data.description,
  }
}

// Custom MDX rendering components mapped to Invocly's design system
const mdxComponents = {
  h1: (props: any) => <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mt-8 mb-4" {...props} />,
  h2: (props: any) => <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white mt-8 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2" {...props} />,
  h3: (props: any) => <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mt-6 mb-3" {...props} />,
  p: (props: any) => <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700 dark:text-gray-300 text-base sm:text-lg" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-700 dark:text-gray-300 text-base sm:text-lg" {...props} />,
  li: (props: any) => <li className="mb-1" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 px-6 py-4 rounded-r-2xl my-8 text-lg font-normal italic text-gray-800 dark:text-gray-200" {...props} />
  ),
  a: (props: any) => (
    <a className="text-blue-600 dark:text-blue-400 font-medium underline underline-offset-4 hover:text-blue-800 dark:hover:text-blue-300 transition-colors" {...props} />
  ),
  code: (props: any) => (
    <code className="bg-gray-100 dark:bg-gray-800 text-sm font-mono px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400" {...props} />
  ),
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const postsDirectory = path.join(process.cwd(), 'app', 'blog', '_posts')
  const filePath = path.join(postsDirectory, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    notFound()
  }

  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContent)
  const frontmatter = data as PostFrontmatter

  // Clean out any raw json-ld script tags appended by blog.py, to avoid escaping issues
  const cleanBody = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '').trim()

  const readingTime = calculateReadingTime(cleanBody)

  // Generate FAQ schema dynamically from the frontmatter if present
  let faqSchema: any = null
  if (frontmatter.faq && frontmatter.faq.length > 0) {
    faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: frontmatter.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl flex-grow">
      {/* Dynamic Schema Injection */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-8 font-normal" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
        <ChevronRightIcon size={14} className="text-gray-400" />
        <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
        <ChevronRightIcon size={14} className="text-gray-400" />
        <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[200px] sm:max-w-xs">{frontmatter.title}</span>
      </nav>

      {/* Post Header */}
      <header className="mb-12">
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1.5">
            <CalendarIcon size={14} />
            {new Date(frontmatter.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          <span className="flex items-center gap-1.5">
            <ClockIcon size={14} />
            {readingTime}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
          {frontmatter.title}
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-normal italic border-l-2 border-gray-300 dark:border-gray-700 pl-4 mb-6">
          {frontmatter.description}
        </p>

        {frontmatter.keyword && (
          <Badge variant="secondary" className="px-3 py-1 rounded-full text-xs font-normal">
            Topic: {frontmatter.keyword}
          </Badge>
        )}
      </header>

      {/* Body Content */}
      <div className="max-w-3xl mx-auto">
        <MDXRemote source={cleanBody} components={mdxComponents} />
      </div>

      {/* Post Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Need to convert files to speech?</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
          Invocly converts PDF, DOCX, and TXT files to high-quality audio formats using lifelike AI voices. Try it for free today!
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-blue-500/20 bg-blue-600 hover:bg-blue-700 px-6 py-3 text-base font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            Start Listening Free
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-6 py-3 text-base font-medium text-gray-750 dark:text-gray-200 shadow-sm transition-all duration-300"
          >
            Back to Articles
          </Link>
        </div>
      </footer>
    </article>
  )
}
