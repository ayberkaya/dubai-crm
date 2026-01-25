# Quick Start Guide

## First Time Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Initialize database:**
   ```bash
   pnpm db:push
   ```

3. **Seed with sample data (optional):**
   ```bash
   pnpm db:seed
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

5. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Key Workflows

### Adding Your First Lead

1. Click **"New Lead"** in the navigation
2. Enter at least one contact method (name, phone, or email)
3. Fill in property requirements
4. **Duplicate Warning**: If you enter a phone or email that already exists, you'll see a yellow warning box with links to existing leads. You can still create the lead if needed.
5. Click **"Create Lead"**

The system automatically schedules a follow-up in 2 days.

### Following Up

- **Mark as Contacted**: Click the button on any lead detail page to update `last_contacted_at` and auto-schedule next follow-up
- **Add Notes**: Use the timeline section to add activity notes
- **Schedule Follow-up**: Set `next_follow_up_at` in the lead form

### Understanding Overdue Leads

A lead is marked **OVERDUE** if:
- It was created 48+ hours ago and has never been contacted (`last_contacted_at` is null)
- OR its `next_follow_up_at` date has passed

### Dashboard Sections

- **Overdue**: Immediate action required (red badge)
- **Due Today**: Follow-ups scheduled for today
- **Due Next 7 Days**: Upcoming follow-ups

### Search & Filter

- **Search**: Type in the search bar to find leads by name, phone, email, areas, or notes
- **Filter Button**: Click the "Filters" button to show/hide filter options
- **Filters**: Use dropdowns to filter by status, type, source, priority, language, or budget
- **Sorting**: Choose from multiple sort options (urgency, name, date, budget, priority)
- **View Modes**: Switch between grid and list views using the view toggle buttons
- Results are automatically sorted by urgency by default

### Notifications

- Browser will request notification permission on first load
- Notifications appear in the Settings page
- System checks for new notifications every 60 seconds while app is open
- Click any notification to go to the lead detail page

### Communication

- **WhatsApp**: Click the green "WA" or "WhatsApp" button next to any phone number to instantly open a WhatsApp chat
- WhatsApp links work on lead detail pages, cards, and list items
- Phone numbers are automatically formatted with UAE country code

## Tips

- Use keyboard shortcuts where available (browser defaults)
- The search is real-time - no need to press enter
- Lead cards show key information at a glance
- Use the timeline to track all interactions with a lead
- Dark mode respects your system preferences by default
- Click the filter button to collapse filters and save screen space
- Duplicate warnings help prevent creating duplicate leads accidentally

## Troubleshooting

**Database errors:**
- Run `pnpm db:push` to sync schema
- Delete `prisma/dev.db` and run `pnpm db:push` again to reset

**Notifications not working:**
- Check browser notification permissions in Settings
- Notifications only work when the app is open (browser limitation)

**Build errors:**
- Run `pnpm install` to ensure all dependencies are installed
- Run `pnpm db:push` before building
