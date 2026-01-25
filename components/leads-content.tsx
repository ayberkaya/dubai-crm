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
import { Search, X } from "lucide-react"
import type { LeadStatus, LeadType, LeadSource, Priority, Language } from "@/lib/types"
import { sortLeadsByUrgency, type LeadWithRelations } from "@/lib/lead-utils"

export function LeadsContent() {
  const [leads, setLeads] = useState<LeadWithRelations[]>([])
  const [loading, setLoading] = useState(true)
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

  const loadLeads = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getLeads({
        search: search || undefined,
        ...filters,
        budgetMin: filters.budgetMin ? parseInt(filters.budgetMin) : undefined,
        budgetMax: filters.budgetMax ? parseInt(filters.budgetMax) : undefined,
      })
      const sorted = sortLeadsByUrgency(data)
      setLeads(sorted)
    } catch (error) {
      console.error("Failed to load leads:", error)
    } finally {
      setLoading(false)
    }
  }, [search, filters])

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
        <Button onClick={loadLeads} variant="outline" size="sm">
          Refresh
        </Button>
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
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} showUrgency />
          ))}
        </div>
      )}
    </div>
  )
}
