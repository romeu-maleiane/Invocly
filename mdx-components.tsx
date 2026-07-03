import React, { ComponentPropsWithoutRef } from 'react'
import Link from 'next/link'
import { highlight } from 'sugar-high'
import type { MDXComponents } from 'mdx/types'

type HeadingProps = ComponentPropsWithoutRef<'h1'>
type ParagraphProps = ComponentPropsWithoutRef<'p'>
type ListProps = ComponentPropsWithoutRef<'ul'>
type ListItemProps = ComponentPropsWithoutRef<'li'>
type AnchorProps = ComponentPropsWithoutRef<'a'>
type BlockquoteProps = ComponentPropsWithoutRef<'blockquote'>
type CodeProps = ComponentPropsWithoutRef<'code'>
type PreProps = ComponentPropsWithoutRef<'pre'>
type TableProps = ComponentPropsWithoutRef<'table'>
type StrongProps = ComponentPropsWithoutRef<'strong'>

function Code({ children, ...props }: CodeProps) {
  const codeHTML = highlight(String(children).trimEnd())
  return (
    <code
      dangerouslySetInnerHTML={{ __html: codeHTML }}
      className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono text-blue-600 dark:text-blue-400"
      {...props}
    />
  )
}

function Pre({ children, ...props }: PreProps) {
  return (
    <pre
      className="my-6 overflow-x-auto rounded-xl bg-gray-900 dark:bg-gray-950 p-5 text-sm leading-relaxed"
      {...props}
    >
      {children}
    </pre>
  )
}

function CustomLink({ href, children, ...props }: AnchorProps) {
  if (href?.startsWith('/')) {
    return (
      <Link
        href={href}
        className="text-blue-600 dark:text-blue-400 underline underline-offset-4 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        {...props}
      >
        {children}
      </Link>
    )
  }
  if (href?.startsWith('#')) {
    return (
      <a
        href={href}
        className="text-blue-600 dark:text-blue-400 underline underline-offset-4 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        {...props}
      >
        {children}
      </a>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 underline underline-offset-4 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
      {...props}
    >
      {children}
    </a>
  )
}

const components: MDXComponents = {
  h1: ({ children, ...props }: HeadingProps) => (
    <h1
      className="mt-12 mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: HeadingProps) => (
    <h2
      className="mt-10 mb-4 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: HeadingProps) => (
    <h3
      className="mt-8 mb-3 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: HeadingProps) => (
    <h4
      className="mt-6 mb-2 text-lg font-semibold text-gray-900 dark:text-white"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }: ParagraphProps) => (
    <p
      className="mb-6 text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
      {...props}
    >
      {children}
    </p>
  ),
  ol: ({ children, ...props }: ListProps) => (
    <ol
      className="mb-6 list-decimal pl-6 space-y-2 text-base sm:text-lg text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </ol>
  ),
  ul: ({ children, ...props }: ListProps) => (
    <ul
      className="mb-6 list-disc pl-6 space-y-2 text-base sm:text-lg text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </ul>
  ),
  li: ({ children, ...props }: ListItemProps) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: BlockquoteProps) => (
    <blockquote
      className="my-8 border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 px-6 py-4 rounded-r-2xl italic text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: CustomLink,
  code: Code,
  pre: Pre,
  strong: ({ children, ...props }: StrongProps) => (
    <strong className="font-semibold text-gray-900 dark:text-white" {...props}>
      {children}
    </strong>
  ),
  table: ({ children, ...props }: TableProps) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm text-left" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: ComponentPropsWithoutRef<'th'>) => (
    <th
      className="px-4 py-3 font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => (
    <td
      className="px-4 py-3 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800/60"
      {...props}
    >
      {children}
    </td>
  ),
  hr: () => (
    <hr className="my-10 border-gray-200 dark:border-gray-800" />
  ),
}

export function useMDXComponents(otherComponents: MDXComponents): MDXComponents {
  return {
    ...otherComponents,
    ...components,
  }
}
