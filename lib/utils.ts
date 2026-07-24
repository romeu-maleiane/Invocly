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
    // Remove marcadores de página (ex: "Page 1", "Página 3")
    .replace(/^\s*Pag(?:e|ina)?\s*\.?\s*\d+\s*$/gim, "")
    // Remove separadores decorativos (linhas de ===, ---, etc.)
    .replace(/[-=*#]{3,}/g, "")
    // Remove URLs
    .replace(/https?:\/\/\S+/g, "")
    // Normalizar quebras de linha: colapsar 3+ quebras em parágrafo duplo
    .replace(/(\r\n|\r)/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    // Quebras de linha simples (dentro de um parágrafo) → espaço
    // Mas preservar duplas (separação de parágrafo)
    .replace(/\n(?!\n)/g, " ")
    // Remover caracteres de controlo e não-imprimíveis, mas preservar:
    // - ASCII imprimível (\x20-\x7E)
    // - Latin Extended (À-ÿ, inclui PT, ES, FR, DE, etc.)
    // - Latin Extended-B (Ā-ƿ)
    // - Pontuação tipográfica comum: aspas curvas, travessões, reticências, bullet
    .replace(/[^\x20-\x7EÀ-ƿ\u2013\u2014\u2018\u2019\u201C\u201D\u2026\u2022\n]/g, "")
    // Normalizar espaços múltiplos (mas não os \n)
    .replace(/[ \t]{2,}/g, " ")
    // Corrigir espaço antes de pontuação
    .replace(/[ \t]+([.,;:!?])/g, "$1")
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
