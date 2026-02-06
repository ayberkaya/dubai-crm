import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return ""
  return format(new Date(date), "MMM d, yyyy")
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  return format(new Date(date), "PPP")
}

export function formatAED(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return ""
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function generateWhatsAppLink(phone: string | null): string | null {
  if (!phone) return null;
  // Basic cleanup, assume if it starts with + it's good, otherwise assume AE +971
  let clean = phone.replace(/\D/g, "");
  if (!phone.includes("+")) {
    // If no country code, and looks like mobile, defaulting to UAE for now
    if (clean.startsWith("05")) {
      clean = "971" + clean.substring(1);
    }
  }
  return `https://wa.me/${clean}`;
}

