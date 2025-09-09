import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFormattedDate(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'long' })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day} ${year}`
}

export function advancedCleanText(text: string): string {
  return text
    .replace(/^\s*Page\s*\d+\s*$/gim, "")
    .replace(/[-=]{3,}/g, "")
    .replace(/(\r\n|\n|\r)/gm, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/[^\x20-\x7EÀ-ÿ\n\r]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

export function estimateDuration(text: string, wpm = 200, speed = 1.0) {
  const words = text.trim().split(/\s+/).length;
  const totalMinutes = words / (wpm * speed);
  const totalSeconds = Math.round(totalMinutes * 60);

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
