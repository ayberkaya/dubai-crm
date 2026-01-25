"use client"

import { useState, useEffect, useCallback } from "react"
import { getLeads } from "@/app/actions/leads"
import { LeadCard } from "@/components/lead-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X, Grid3x3, List } from "lucide-react"
import type { LeadStatus, LeadType, LeadSource, Priority, Language } from "@/lib/types"
import { sortLeadsByUrgency, type LeadWithRelations } from "@/lib/lead-utils"
import { LeadListItem } from "@/components/lead-list-item"

type SortOption = 
  | "most_urgent"
  | "name_az"
  | "name_za"
  | "newest"
  | "oldest"
  | "followup_soonest"
  | "budget_high"
  | "budget_low"
  | "priority_high"
  | "priority_low"

export function LeadsContent() {
  const [leads, setLeads] = useState<LeadWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<SortOption>("most_urgent")
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<{
    status?: LeadStatus
    leadType?: LeadType
    source?: LeadSource
    priority?: Priority
    language?: Language
    budgetMin?: string
    budgetMax?: string
  }>({})

  const sortLeads = useCallback((data: LeadWithRelations[]) => {
    switch (sortBy) {
      case "most_urgent":
        return sortLeadsByUrgency(data)
      case "name_az":
        return [...data].sort((a, b) => {
          const nameA = (a.name || a.phone || a.email || "").toLowerCase()
          const nameB = (b.name || b.phone || b.email || "").toLowerCase()
          return nameA.localeCompare(nameB)
        })
      case "name_za":
        return [...data].sort((a, b) => {
          const nameA = (a.name || a.phone || a.email || "").toLowerCase()
          const nameB = (b.name || b.phone || b.email || "").toLowerCase()
          return nameB.localeCompare(nameA)
        })
      case "newest":
        return [...data].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case "oldest":
        return [...data].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      case "followup_soonest":
        return [...data].sort((a, b) => {
          if (!a.nextFollowUpAt && !b.nextFollowUpAt) return 0
          if (!a.nextFollowUpAt) return 1
          if (!b.nextFollowUpAt) return -1
          return new Date(a.nextFollowUpAt).getTime() - new Date(b.nextFollowUpAt).getTime()
        })
      case "budget_high":
        return [...data].sort((a, b) => {
          const budgetA = a.budgetMax || a.budgetMin || 0
          const budgetB = b.budgetMax || b.budgetMin || 0
          return budgetB - budgetA
        })
      case "budget_low":
        return [...data].sort((a, b) => {
          const budgetA = a.budgetMin || a.budgetMax || 0
          const budgetB = b.budgetMin || b.budgetMax || 0
          return budgetA - budgetB
        })
      case "priority_high":
        return [...data].sort((a, b) => {
          const priorityWeight: Record<string, number> = { High: 3, Med: 2, Low: 1 }
          return priorityWeight[b.priority] - priorityWeight[a.priority]
        })
      case "priority_low":
        return [...data].sort((a, b) => {
          const priorityWeight: Record<string, number> = { High: 3, Med: 2, Low: 1 }
          return priorityWeight[a.priority] - priorityWeight[b.priority]
        })
      default:
        return sortLeadsByUrgency(data)
    }
  }, [sortBy])

  const loadLeads = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getLeads({
        search: search || undefined,
        ...filters,
        budgetMin: filters.budgetMin ? parseInt(filters.budgetMin) : undefined,
        budgetMax: filters.budgetMax ? parseInt(filters.budgetMax) : undefined,
      })
      const sorted = sortLeads(data)
      setLeads(sorted)
    } catch (error) {
      console.error("Failed to load leads:", error)
    } finally {
      setLoading(false)
    }
  }, [search, filters, sortBy])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  const clearFilters = () => {
    setFilters({})
    setSearch("")
  }

  const hasActiveFilters = Object.keys(filters).length > 0 || search.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="most_urgent">Most Urgent</SelectItem>
              <SelectItem value="name_az">Name A-Z</SelectItem>
              <SelectItem value="name_za">Name Z-A</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="followup_soonest">Follow-up Soonest</SelectItem>
              <SelectItem value="budget_high">Budget High to Low</SelectItem>
              <SelectItem value="budget_low">Budget Low to High</SelectItem>
              <SelectItem value="priority_high">Priority High to Low</SelectItem>
              <SelectItem value="priority_low">Priority Low to High</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={loadLeads} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, email, areas, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value === "all" ? undefined : (value as LeadStatus) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(["New", "Contacted", "Qualified", "Follow", "Closed"] as LeadStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.leadType || "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, leadType: value === "all" ? undefined : (value as LeadType) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {(["Rental", "OffPlan", "SecondarySale"] as LeadType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/([A-Z])/g, " $1").trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.source || "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, source: value === "all" ? undefined : (value as LeadSource) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {(["WhatsApp", "Instagram", "PropertyFinder", "Referral", "WalkIn", "Other"] as LeadSource[]).map((source) => (
                <SelectItem key={source} value={source}>
                  {source.replace(/([A-Z])/g, " $1").trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priority || "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, priority: value === "all" ? undefined : (value as Priority) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {(["Low", "Med", "High"] as Priority[]).map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min Budget"
            value={filters.budgetMin || ""}
            onChange={(e) =>
              setFilters({ ...filters, budgetMin: e.target.value || undefined })
            }
          />

          <Input
            type="number"
            placeholder="Max Budget"
            value={filters.budgetMax || ""}
            onChange={(e) =>
              setFilters({ ...filters, budgetMax: e.target.value || undefined })
            }
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No leads found. {hasActiveFilters && "Try adjusting your filters."}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} showUrgency />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => (
            <LeadListItem key={lead.id} lead={lead} showUrgency />
          ))}
        </div>
      )}
    </div>
  )
}
