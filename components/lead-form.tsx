"use client"

import { useState, useEffect } from "react"
import { createLead, updateLead, type CreateLeadInput } from "@/app/actions/leads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type {
  LeadStatus,
  LeadType,
  LeadSource,
  Language,
  Priority,
  Furnishing,
} from "@/lib/types"
import type { LeadWithRelations } from "@/lib/lead-utils"

interface LeadFormProps {
  lead?: LeadWithRelations
}

export function LeadForm({ lead }: LeadFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [areas, setAreas] = useState<string>("")
  const [formData, setFormData] = useState<Partial<CreateLeadInput> & { moveInDate?: string; nextFollowUpAt?: string }>({
    name: lead?.name || "",
    phone: lead?.phone || "",
    email: lead?.email || "",
    preferredLanguage: (lead?.preferredLanguage as Language | undefined) || undefined,
    source: (lead?.source as LeadSource | undefined) || undefined,
    sourceCustom: lead?.sourceCustom || "",
    leadType: (lead?.leadType as LeadType | undefined) || undefined,
    budgetMin: lead?.budgetMin || undefined,
    budgetMax: lead?.budgetMax || undefined,
    beds: lead?.beds || undefined,
    baths: lead?.baths || undefined,
    furnishing: (lead?.furnishing as Furnishing | undefined) || undefined,
    moveInDate: lead?.moveInDate
      ? (typeof lead.moveInDate === "string" 
          ? new Date(lead.moveInDate).toISOString().split("T")[0]
          : lead.moveInDate.toISOString().split("T")[0])
      : "",
    notes: lead?.notes || "",
    status: (lead?.status as LeadStatus) || "New",
    priority: (lead?.priority as Priority) || "Med",
    nextFollowUpAt: lead?.nextFollowUpAt
      ? new Date(lead.nextFollowUpAt).toISOString().slice(0, 16)
      : "",
  })

  useEffect(() => {
    if (lead?.areas) {
      const areasArray = Array.isArray(lead.areas) ? lead.areas : JSON.parse(lead.areas || "[]")
      setAreas(areasArray.join(", "))
    }
  }, [lead])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const areasArray = areas
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)

      const data: CreateLeadInput = {
        ...formData,
        areas: areasArray,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : undefined,
        beds: formData.beds ? Number(formData.beds) : undefined,
        baths: formData.baths ? Number(formData.baths) : undefined,
        moveInDate: formData.moveInDate && typeof formData.moveInDate === "string" ? new Date(formData.moveInDate) : undefined,
        nextFollowUpAt: formData.nextFollowUpAt
          ? new Date(formData.nextFollowUpAt)
          : undefined,
      }

      if (lead) {
        await updateLead(lead.id, data)
        toast({
          title: "Lead updated",
        })
      } else {
        await createLead(data)
        toast({
          title: "Lead created",
        })
        router.push("/leads")
      }
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save lead",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredLanguage">Preferred Language</Label>
          <Select
            value={formData.preferredLanguage || "none"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                preferredLanguage: value === "none" ? undefined : (value as Language),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {(["EN", "TR", "RU", "AR"] as Language[]).map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Select
            value={formData.source || "none"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                source: value === "none" ? undefined : (value as LeadSource),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {(["WhatsApp", "Instagram", "PropertyFinder", "Referral", "WalkIn", "Other"] as LeadSource[]).map((source) => (
                <SelectItem key={source} value={source}>
                  {source.replace(/([A-Z])/g, " $1").trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.source === "Other" && (
          <div className="space-y-2">
            <Label htmlFor="sourceCustom">Custom Source</Label>
            <Input
              id="sourceCustom"
              value={formData.sourceCustom}
              onChange={(e) =>
                setFormData({ ...formData, sourceCustom: e.target.value })
              }
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="leadType">Lead Type</Label>
          <Select
            value={formData.leadType || "none"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                leadType: value === "none" ? undefined : (value as LeadType),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {(["Rental", "OffPlan", "SecondarySale"] as LeadType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/([A-Z])/g, " $1").trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status || "New"}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value as LeadStatus })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["New", "Contacted", "Qualified", "Viewing", "Negotiation", "Won", "Lost"] as LeadStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority || "Med"}
            onValueChange={(value) =>
              setFormData({ ...formData, priority: value as Priority })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["Low", "Med", "High"] as Priority[]).map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgetMin">Budget Min (AED)</Label>
          <Input
            id="budgetMin"
            type="number"
            value={formData.budgetMin || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                budgetMin: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgetMax">Budget Max (AED)</Label>
          <Input
            id="budgetMax"
            type="number"
            value={formData.budgetMax || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                budgetMax: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="areas">Areas (comma-separated)</Label>
          <Input
            id="areas"
            value={areas}
            onChange={(e) => setAreas(e.target.value)}
            placeholder="Dubai Marina, Downtown"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="beds">Beds</Label>
          <Input
            id="beds"
            type="number"
            min="0"
            value={formData.beds || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                beds: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="baths">Baths</Label>
          <Input
            id="baths"
            type="number"
            min="0"
            value={formData.baths || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                baths: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="furnishing">Furnishing</Label>
          <Select
            value={formData.furnishing || "none"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                furnishing: value === "none" ? undefined : (value as Furnishing),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select furnishing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {(["Furnished", "Unfurnished"] as Furnishing[]).map((furnishing) => (
                <SelectItem key={furnishing} value={furnishing}>
                  {furnishing}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="moveInDate">Move-in Date</Label>
          <Input
            id="moveInDate"
            type="date"
            value={(typeof formData.moveInDate === "string" ? formData.moveInDate : "") || ""}
            onChange={(e) =>
              setFormData({ ...formData, moveInDate: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextFollowUpAt">Next Follow-up</Label>
          <Input
            id="nextFollowUpAt"
            type="datetime-local"
            value={(typeof formData.nextFollowUpAt === "string" ? formData.nextFollowUpAt : "") || ""}
            onChange={(e) =>
              setFormData({ ...formData, nextFollowUpAt: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
      </Button>
    </form>
  )
}
