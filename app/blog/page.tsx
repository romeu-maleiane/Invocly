import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import matter from 'gray-matter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarIcon, ClockIcon, ArrowRightIcon } from 'lucide-react'

interface PostFrontmatter {
  title: string
  description: string
  slug: string
  date: string
  keyword: string
  faq?: Array<{ question: string; answer: string }>
}

interface BlogPost {
  slug: string
  frontmatter: PostFrontmatter
  readingTime: string
}

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 225
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min read`
}

export default async function BlogIndexPage() {
  const postsDirectory = path.join(process.cwd(), 'app', 'blog', '_posts')
  let posts: BlogPost[] = []

  if (fs.existsSync(postsDirectory)) {
    const filenames = fs.readdirSync(postsDirectory)
    posts = filenames
      .filter((filename) => filename.endsWith('.mdx'))
      .map((filename) => {
        const filePath = path.join(postsDirectory, filename)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const { data, content } = matter(fileContent)

        return {
          slug: filename.replace('.mdx', ''),
          frontmatter: data as PostFrontmatter,
          readingTime: calculateReadingTime(content),
        }
      })
      .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl flex-grow">
      {/* Hero Section */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 text-sm font-normal text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
          Invocly Library
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
          The Invocly <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Blog</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
          Explore expert guides, research-backed study hacks, and tutorials on text-to-speech, auditory learning, and document accessibility.
        </p>
      </div>

      {posts.length === 0 ? (
        <Card className="max-w-md mx-auto text-center p-8 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800 rounded-3xl shadow-sm">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
              <ClockIcon size={32} />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Writing in Progress</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Our weekly SEO pipeline runs every workday to bring you the best tips. Check back shortly for our first publication!
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block h-full">
              <Card className="h-full flex flex-col justify-between bg-white dark:bg-gray-900/80 border border-gray-200/60 dark:border-gray-800 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300">
                <div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon size={14} />
                      {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span className="flex items-center gap-1.5">
                      <ClockIcon size={14} />
                      {post.readingTime}
                    </span>
                  </div>
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {post.frontmatter.title}
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-400 leading-relaxed font-normal mt-2 line-clamp-3">
                      {post.frontmatter.description}
                    </CardDescription>
                  </CardHeader>
                </div>
                <CardContent className="p-0 pt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all duration-300">
                  Read Article
                  <ArrowRightIcon size={16} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
