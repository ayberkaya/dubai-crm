// Type definitions for enums (SQLite doesn't support enums, so we use strings)

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Follow" | "Closed"
export type LeadType = "Rental" | "OffPlan" | "SecondarySale"
export type LeadSource = "WhatsApp" | "Instagram" | "PropertyFinder" | "Referral" | "WalkIn" | "Other"
export type Language = "EN" | "TR" | "RU" | "AR"
export type Priority = "Low" | "Med" | "High"
export type Furnishing = "Furnished" | "Unfurnished"
export type NotificationType = "OverdueNewContact" | "OverdueFollowUp" | "DueToday"

// Constants for easy access
export const LeadStatusValues: LeadStatus[] = ["New", "Contacted", "Qualified", "Follow", "Closed"]
export const LeadTypeValues: LeadType[] = ["Rental", "OffPlan", "SecondarySale"]
export const LeadSourceValues: LeadSource[] = ["WhatsApp", "Instagram", "PropertyFinder", "Referral", "WalkIn", "Other"]
export const LanguageValues: Language[] = ["EN", "TR", "RU", "AR"]
export const PriorityValues: Priority[] = ["Low", "Med", "High"]
export const FurnishingValues: Furnishing[] = ["Furnished", "Unfurnished"]
export const NotificationTypeValues: NotificationType[] = ["OverdueNewContact", "OverdueFollowUp", "DueToday"]
