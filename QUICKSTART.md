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
4. Click **"Create Lead"**

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
- **Filters**: Use dropdowns to filter by status, type, source, priority, language, or budget
- Results are automatically sorted by urgency

### Notifications

- Browser will request notification permission on first load
- Notifications appear in the Settings page
- System checks for new notifications every 60 seconds while app is open
- Click any notification to go to the lead detail page

## Tips

- Use keyboard shortcuts where available (browser defaults)
- The search is real-time - no need to press enter
- Lead cards show key information at a glance
- Use the timeline to track all interactions with a lead
- Dark mode respects your system preferences by default

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
