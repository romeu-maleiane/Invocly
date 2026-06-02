## Overview

Design System for Invocly, established to provide a consistent, premium SaaS experience.

## Colors

Maintains the core brand identity while mapping to a structured token system.

- **Background**: White `#ffffff` (Dark mode: Gray-950 `#030712`)
- **Surface/Card**: White `#ffffff` (Dark mode: Gray-900 `#111827`)
- **Primary Brand**: Blue-600 `#2563eb` (Dark mode: Blue-500 `#3b82f6`)
- **Secondary Brand**: Indigo-100 `#e0e7ff` (Dark mode: Indigo-900/50 `#312e81`)
- **Foreground (Text)**: Gray-950 `#030712` (Dark mode: Gray-50 `#f9fafb`)
- **Muted Text**: Gray-500 `#6b7280` (Dark mode: Gray-400 `#9ca3af`)
- **Borders**: Gray-200 `#e5e7eb` (Dark mode: Gray-800 `#1f2937`)

## Typography

- **Font Family**: Geist (Primary for all UI elements).
- **Headings**: Tighter letter-spacing (tracking-tight to tracking-tighter), semibold to extrabold.
  - H1: 48px to 72px (Desktop), leading-tight.
  - H2: 36px to 48px, leading-tight.
  - H3: 24px to 30px, leading-snug.
- **Body**: Relaxed reading experience (leading-relaxed for long text, leading-normal for UI).
  - Base: 16px to 18px.
  - Small: 14px.

## Spacing & Layout

- **Base Scale**: 4pt/8pt grid system.
- **Section Spacing**: `py-24` (96px) for Desktop sections, `py-16` (64px) for Mobile sections.
- **Inner Padding**: `p-6` or `p-8` for premium cards.
- **Container**: Max-width of `max-w-6xl` (1152px) for general content, `max-w-4xl` for focused reading or narrow grids.

## Borders & Radius

- **Radius**: `rounded-2xl` (16px) or `rounded-xl` (12px) for major cards/surfaces. `rounded-full` for pills and primary action buttons.
- **Borders**: Subtle `border` (1px) using `border-gray-200` in light mode, `border-gray-800` in dark mode. Glassmorphic cards use `border-white/20`.

## Elevation & Shadows

- **Soft Shadows**: Use `shadow-sm` for buttons/chips.
- **Card Shadows**: Use `shadow-lg` combined with `shadow-gray-200/50` for light mode cards. Dark mode relies on border contrast rather than shadows.
- **Hover States**: Cards lift with `-translate-y-1` and `shadow-xl`.

## Components

### Buttons
- **Primary**: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 text-base font-medium text-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50`.
- **Secondary**: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-white/70 bg-white/50 px-5 text-base font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 disabled:pointer-events-none disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15`.
- **Ghost/Subtle**: `text-gray-600 hover:text-gray-900 hover:bg-gray-100`.

### Cards
- **Premium Card**: `bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 dark:bg-gray-900 dark:border-gray-800`.
- **Glass Card**: `bg-white/70 backdrop-blur-md border border-white/20 shadow-xl`.

## Animations & Interactions

- **Transitions**: Use `transition-all duration-300 ease-in-out` for most hover states.
- **Micro-interactions**: 
  - Buttons slightly scale down on click (`active:scale-95`).
  - Cards slightly translate up on hover (`hover:-translate-y-1`).
  - Fade-in effects for elements entering the viewport.

## Responsive Breakpoints
- `sm`: 640px (Mobile landscape)
- `md`: 768px (Tablet)
- `lg`: 1024px (Small Desktop)
- `xl`: 1280px (Desktop)
