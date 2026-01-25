import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create sample leads
  const leads = [
    {
      name: "Ahmed Al Maktoum",
      phone: "+971501234567",
      email: "ahmed@example.com",
      preferredLanguage: "AR",
      source: "WhatsApp",
      leadType: "Rental",
      budgetMin: 50000,
      budgetMax: 80000,
      areas: JSON.stringify(["Dubai Marina", "JBR"]),
      beds: 2,
      baths: 2,
      furnishing: "Furnished",
      moveInDate: new Date("2026-03-01"),
      status: "New",
      priority: "High",
      nextFollowUpAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Overdue
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      name: "Sarah Johnson",
      phone: "+971502345678",
      email: "sarah@example.com",
      preferredLanguage: "EN",
      source: "PropertyFinder",
      leadType: "SecondarySale",
      budgetMin: 2000000,
      budgetMax: 3000000,
      areas: JSON.stringify(["Downtown", "Business Bay"]),
      beds: 3,
      baths: 3,
      furnishing: "Unfurnished",
      status: "Qualified",
      priority: "High",
      nextFollowUpAt: new Date(), // Due today
      lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Mehmet Yılmaz",
      phone: "+971503456789",
      email: "mehmet@example.com",
      preferredLanguage: "TR",
      source: "Instagram",
      leadType: "OffPlan",
      budgetMin: 1500000,
      budgetMax: 2000000,
      areas: JSON.stringify(["Palm Jumeirah"]),
      beds: 4,
      baths: 4,
      furnishing: "Furnished",
      status: "Viewing",
      priority: "Med",
      nextFollowUpAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
      lastContactedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Ivan Petrov",
      phone: "+971504567890",
      email: "ivan@example.com",
      preferredLanguage: "RU",
      source: "Referral",
      leadType: "Rental",
      budgetMin: 60000,
      budgetMax: 100000,
      areas: JSON.stringify(["Dubai Marina", "JLT"]),
      beds: 1,
      baths: 1,
      furnishing: "Furnished",
      status: "Contacted",
      priority: "Low",
      nextFollowUpAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
      lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Fatima Hassan",
      phone: "+971505678901",
      email: "fatima@example.com",
      preferredLanguage: "AR",
      source: "WalkIn",
      leadType: "SecondarySale",
      budgetMin: 1500000,
      budgetMax: 2500000,
      areas: JSON.stringify(["Dubai Hills", "Arabian Ranches"]),
      beds: 3,
      baths: 2,
      furnishing: "Unfurnished",
      status: "Negotiation",
      priority: "High",
      nextFollowUpAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      lastContactedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      name: "John Smith",
      phone: "+971506789012",
      email: "john@example.com",
      preferredLanguage: "EN",
      source: "PropertyFinder",
      leadType: "Rental",
      budgetMin: 40000,
      budgetMax: 60000,
      areas: JSON.stringify(["Downtown"]),
      beds: 1,
      baths: 1,
      furnishing: "Furnished",
      status: "New",
      priority: "Med",
      // No nextFollowUpAt - will be overdue (not contacted in 48h)
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago, not contacted
    },
  ]

  for (const leadData of leads) {
    const lead = await prisma.lead.create({
      data: leadData,
    })

    // Add some notes for a few leads
    if (lead.name === "Ahmed Al Maktoum") {
      await prisma.leadNote.create({
        data: {
          leadId: lead.id,
          content: "Interested in 2BR in Dubai Marina. Budget flexible. Prefers furnished.",
        },
      })
    }

    if (lead.name === "Sarah Johnson") {
      await prisma.leadNote.create({
        data: {
          leadId: lead.id,
          content: "Looking for investment property. Wants to see properties in Downtown area.",
        },
      })
      await prisma.leadNote.create({
        data: {
          leadId: lead.id,
          content: "Scheduled viewing for next week. Follow up after viewing.",
        },
      })
    }
  }

  console.log(`Created ${leads.length} sample leads`)
  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
