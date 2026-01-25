# Dubai RCRM

A premium, single-user Lead CRM for Dubai real estate follow-ups. Built for speed and zero clutter.

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Prisma** with SQLite for local database
- **Server Actions** for data mutations

## Features

- **Lead Management**: Capture and manage leads with comprehensive information
- **Follow-up Logic**: Automatic overdue detection (48h rule) and follow-up scheduling
- **Dashboard**: View overdue, due today, and upcoming leads
- **Search & Filters**: Fast search across all lead fields with advanced filtering
- **Timeline & Notes**: Activity timeline with notes for each lead
- **Notifications**: In-app notifications with browser notification support
- **Dark Mode**: System-aware theme switching
- **Premium UI**: Clean, minimal design with smooth animations

## Setup

### Prerequisites

- Node.js 18+ and pnpm installed
- macOS (for local development)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up the database:
```bash
pnpm db:push
```

3. (Optional) Seed the database with sample data:
```bash
pnpm db:seed
```

### Development

Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build and start the production server:
```bash
pnpm build
pnpm start
```

## Database Management

- **Push schema changes**: `pnpm db:push`
- **Create migration**: `pnpm db:migrate`
- **Open Prisma Studio**: `pnpm db:studio`
- **Seed database**: `pnpm db:seed`

## Usage Guide

### Adding a Lead

1. Click "New Lead" in the navigation
2. Fill in at least one of: name, phone, or email (required)
3. Add property requirements, budget, areas, etc.
4. Click "Create Lead"

The system will automatically set `next_follow_up_at` to 2 days from now if not specified.

### Follow-up Rules

- **48-Hour Rule**: If a lead is created and NOT contacted within 48 hours, it shows as "OVERDUE"
- **Follow-up Overdue**: If `next_follow_up_at` is in the past, the lead is overdue
- **Mark as Contacted**: Use the "Mark as Contacted" button to update `last_contacted_at` and optionally auto-schedule the next follow-up

### Dashboard

The dashboard shows three sections:
- **Overdue**: Leads that need immediate attention (red badge)
- **Due Today**: Follow-ups scheduled for today
- **Due Next 7 Days**: Upcoming follow-ups

### Search & Filters

- Use the search bar to find leads by name, phone, email, areas, or notes
- Apply filters for status, type, source, priority, language, and budget range
- Results are sorted by urgency (overdue first, then by due date)

### Notifications

- In-app notifications appear in the Settings page
- Browser notifications are requested on first load (if permission granted)
- Notifications are checked every 60 seconds while the app is open
- Notifications are deduplicated by lead + type + day

### Settings

- **Appearance**: Toggle between light, dark, and system theme
- **Follow-up Settings**: Enable/disable auto-scheduling of next follow-up when marking as contacted
- **Notifications**: View and manage all notifications

## Data Model

### Lead Fields

- **Contact**: name, phone, email, preferredLanguage
- **Source**: source (enum), sourceCustom
- **Type**: leadType (Rental/OffPlan/SecondarySale)
- **Budget**: budgetMin, budgetMax (AED)
- **Requirements**: areas (array), beds, baths, furnishing, moveInDate
- **Status**: status (enum), priority (Low/Med/High)
- **Follow-up**: nextFollowUpAt, lastContactedAt
- **Metadata**: notes, createdAt, updatedAt

### Enums

- **Status**: New, Contacted, Qualified, Viewing, Negotiation, Won, Lost
- **Type**: Rental, OffPlan, SecondarySale
- **Source**: WhatsApp, Instagram, PropertyFinder, Referral, WalkIn, Other
- **Language**: EN, TR, RU, AR
- **Priority**: Low, Med, High
- **Furnishing**: Furnished, Unfurnished

## Architecture

- **Server Actions**: All data mutations use Next.js Server Actions
- **Type Safety**: Full TypeScript coverage with Prisma-generated types
- **Client Components**: Only used for interactivity (forms, filters, real-time updates)
- **Server Components**: Default for data fetching and rendering

## File Structure

```
├── app/
│   ├── actions/          # Server actions (leads, notes, notifications)
│   ├── leads/            # Lead pages (list, detail, new)
│   ├── settings/         # Settings page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-content.tsx
│   ├── leads-content.tsx
│   ├── lead-*.tsx        # Lead-related components
│   ├── nav.tsx
│   └── ...
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── utils.ts          # Utility functions
│   └── lead-utils.ts     # Lead urgency calculations
└── prisma/
    ├── schema.prisma     # Database schema
    └── seed.ts           # Seed script
```

## Notes

- Database is stored locally in `prisma/dev.db` (SQLite)
- No external services or APIs required
- All data is local to your machine
- Notifications work only when the app is open (browser-based)

## License

Private use only.
