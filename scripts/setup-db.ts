import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { existsSync } from 'fs';

// Load environment variables
if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config();
}

const sql = neon(process.env.DATABASE_URL!);

async function setupDatabase() {
  console.log('🚀 Setting up database...');

  try {
    // Create enum type
    console.log('Creating transaction_type enum...');
    await sql`
      DO $$ BEGIN
        CREATE TYPE transaction_type AS ENUM ('income', 'expense');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create accounts table
    console.log('Creating accounts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(256) NOT NULL,
        name VARCHAR(128) NOT NULL,
        balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create transactions table
    console.log('Creating transactions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(256) NOT NULL,
        description TEXT NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        type transaction_type NOT NULL,
        category VARCHAR(128) NOT NULL,
        account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
        account_name VARCHAR(128) NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create budgets table
    console.log('Creating budgets table...');
    await sql`
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(256) NOT NULL,
        category VARCHAR(128) NOT NULL,
        "limit" NUMERIC(12, 2) NOT NULL,
        spent NUMERIC(12, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create goals table
    console.log('Creating goals table...');
    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(256) NOT NULL,
        name VARCHAR(256) NOT NULL,
        target_amount NUMERIC(12, 2) NOT NULL,
        current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
        deadline DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
