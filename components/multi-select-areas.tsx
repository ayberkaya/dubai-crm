"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { DUBAI_AREAS } from "@/lib/dubai-areas"

interface MultiSelectAreasProps {
  value: string[]
  onChange: (areas: string[]) => void
}

export function MultiSelectAreas({ value, onChange }: MultiSelectAreasProps) {
  const handleAddArea = (area: string) => {
    if (!value.includes(area)) {
      onChange([...value, area])
    }
  }

  const handleRemoveArea = (area: string) => {
    onChange(value.filter((a) => a !== area))
  }

  const availableAreas = DUBAI_AREAS.filter((area) => !value.includes(area))

  return (
    <div className="space-y-2">
      <Select
        value=""
        onValueChange={handleAddArea}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select area" />
        </SelectTrigger>
        <SelectContent>
          {availableAreas.map((area) => (
            <SelectItem key={area} value={area}>
              {area}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((area) => (
            <Badge
              key={area}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {area}
              <button
                type="button"
                onClick={() => handleRemoveArea(area)}
                className="ml-1 rounded-full hover:bg-secondary-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
