# Database Setup Guide

## Step 1: Install drizzle-kit

First, install the required package:

```bash
npm install
```

This will install `drizzle-kit` which was added to your devDependencies.

## Step 2: Push Schema to Database

Since your database is already set up on Neon, you just need to push your schema:

```bash
npm run db:push
```

This will sync your schema (`src/db/schema.ts`) with your Neon database without creating migration files.

## Available Commands

### `npm run db:push`
**Recommended for development** - Directly pushes schema changes to the database without generating migration files. Fast and convenient.

```bash
npm run db:push
```

### `npm run db:generate`
Generates SQL migration files based on your schema changes. Creates files in the `drizzle/` folder.

```bash
npm run db:generate
```

### `npm run db:migrate`
Applies generated migration files to your database. Use after `db:generate`.

```bash
npm run db:migrate
```

### `npm run db:studio`
Opens Drizzle Studio - a visual database browser at `https://local.drizzle.studio`

```bash
npm run db:studio
```

## Which Command Should I Use?

### For Quick Development (Recommended):
```bash
npm run db:push
```
✅ Fast and simple
✅ No migration files to manage
✅ Perfect for prototyping

### For Production:
```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Apply to database
```
✅ Version-controlled migrations
✅ Rollback capability
✅ Safe for production deployments

## Troubleshooting

### Error: "drizzle-kit not found"
```bash
npm install
```

### Error: "DATABASE_URL is not defined"
Make sure `.env.local` exists with:
```env
DATABASE_URL=postgresql://...
```

### Error: "Failed to connect"
- Check your internet connection
- Verify Neon database credentials
- Ensure Neon database is active (not paused)

### Error: "Schema sync error"
Try running:
```bash
npm run db:push -- --force
```

## Your Current Setup

✅ **Config**: `drizzle.config.ts`
✅ **Schema**: `src/db/schema.ts`
✅ **Database**: Neon PostgreSQL
✅ **Scripts**: All added to package.json

## Next Steps

1. Run `npm install`
2. Run `npm run db:push`
3. Start your app with `npm run dev`
4. Visit `http://localhost:9002`

Your database tables will be automatically created! 🎉
