import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAED(amount: number | null | undefined): string {
  if (amount == null) return "—"
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d)
}

/**
 * Generates a WhatsApp chat link for a phone number
 * @param phone - Phone number (can include +, spaces, dashes - will be cleaned)
 * @param message - Optional pre-filled message
 * @returns WhatsApp web URL
 */
export function generateWhatsAppLink(phone: string | null | undefined, message?: string): string | null {
  if (!phone) return null
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "")
  
  // If no + prefix, assume UAE country code (+971)
  const phoneNumber = cleaned.startsWith("+") ? cleaned : `+971${cleaned}`
  
  // Remove + for URL encoding
  const encodedPhone = phoneNumber.replace("+", "")
  
  const baseUrl = `https://wa.me/${encodedPhone}`
  if (message) {
    const encodedMessage = encodeURIComponent(message)
    return `${baseUrl}?text=${encodedMessage}`
  }
  
  return baseUrl
}
