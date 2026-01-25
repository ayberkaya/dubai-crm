"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createNote(leadId: string, content: string) {
  if (!content.trim()) {
    throw new Error("Note content is required")
  }

  const note = await prisma.leadNote.create({
    data: {
      leadId,
      content: content.trim(),
    },
  })

  revalidatePath("/")
  revalidatePath("/leads")
  revalidatePath(`/leads/${leadId}`)
  return note
}

export async function deleteNote(id: string, leadId: string) {
  await prisma.leadNote.delete({
    where: { id },
  })

  revalidatePath(`/leads/${leadId}`)
}
