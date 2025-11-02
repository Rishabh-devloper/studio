# WealthWise - Quick Start Guide 🚀

## Environment Setup

Create a `.env.local` file in the root directory with:

```env
# Database (Neon)
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# AI Features (if using)
GOOGLE_GENAI_API_KEY="..."
```

## Installation & Run

```bash
# Install dependencies
npm install

# Push database schema (first time only)
npm run db:push

# Run development server
npm run dev
```

Visit: `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page ✅
│   ├── dashboard/            # Main dashboard ✅
│   ├── transactions/         # Transactions page ✅
│   ├── budgets/              # Budgets page ✅
│   ├── goals/                # Goals page ✅
│   ├── reports/              # Reports & analytics ✅
│   ├── settings/             # User settings ✅
│   └── actions.ts            # Server actions ✅
├── components/
│   ├── dashboard/            # Dashboard components
│   ├── budgets/              # Budget components
│   ├── goals/                # Goal components
│   ├── reports/              # Report components ✅
│   ├── layout/               # Layout components
│   └── ui/                   # UI primitives
└── db/
    ├── index.ts              # Database connection
    └── schema.ts             # Database schema
```

## Key Features

### ✅ Completed & Working
- Landing page with hero, features, testimonials
- User authentication (Clerk)
- Dashboard with real-time financial data
- Transaction management with AI categorization
- Budget tracking with progress visualization
- Goal setting with deadline tracking
- Expense reports and analytics
- User settings and profile management
- Fully responsive design
- Accessibility compliant

### 🔒 Security
- All queries filter by `userId`
- Authentication required for all protected routes
- Input validation with Zod
- SQL injection protection via Drizzle ORM

## Common Tasks

### Add a New Transaction
1. Navigate to Dashboard or Transactions page
2. Click "Add Transaction" button
3. Fill in description, amount, type, category, account
4. Optional: Use AI suggestion (wand icon) for category
5. Submit

### Create a Budget
1. Navigate to Budgets page
2. Click "New Budget" button
3. Select category and set limit
4. Submit

### Set a Goal
1. Navigate to Goals page
2. Click "New Goal" button
3. Enter goal name, target amount, and deadline
4. Submit

### View Reports
1. Navigate to Reports page
2. See spending breakdown by category
3. View summary statistics

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` in `.env.local`
- Run `npm run db:push` to sync schema
- Check Neon dashboard for connection status

### Authentication Issues
- Verify Clerk keys in `.env.local`
- Check Clerk dashboard for application settings
- Ensure redirect URLs are configured

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon (PostgreSQL)
- **ORM**: Drizzle
- **Auth**: Clerk
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **AI**: Google Generative AI (optional)

## Need Help?

1. Check `REFACTOR_COMPLETE.md` for detailed documentation
2. Review code comments in modified files
3. Check browser console for errors
4. Verify all environment variables are set

---

**Status**: ✅ Production Ready

All features implemented, tested, and documented!
