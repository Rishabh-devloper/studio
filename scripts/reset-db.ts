import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { existsSync } from 'fs';

if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config();
}

const sql = neon(process.env.DATABASE_URL!);

async function resetDatabase() {
  console.log('🗑️  Resetting database...');

  try {
    // Drop tables in correct order (handle foreign key constraints)
    console.log('Dropping existing tables...');
    await sql`DROP TABLE IF EXISTS transactions CASCADE`;
    await sql`DROP TABLE IF EXISTS budgets CASCADE`;
    await sql`DROP TABLE IF EXISTS goals CASCADE`;
    await sql`DROP TABLE IF EXISTS accounts CASCADE`;
    await sql`DROP TYPE IF EXISTS transaction_type CASCADE`;

    console.log('✅ Tables dropped');

    // Create enum
    console.log('Creating transaction_type enum...');
    await sql`CREATE TYPE transaction_type AS ENUM ('income', 'expense')`;

    // Create accounts table
    console.log('Creating accounts table...');
    await sql`
      CREATE TABLE accounts (
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
      CREATE TABLE transactions (
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
      CREATE TABLE budgets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        category TEXT NOT NULL,
        "limit" NUMERIC(12, 2) NOT NULL,
        spent NUMERIC(12, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create goals table
    console.log('Creating goals table...');
    await sql`
      CREATE TABLE goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        target_amount NUMERIC(12, 2) NOT NULL,
        current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
        deadline DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX idx_transactions_user_id ON transactions(user_id)`;
    await sql`CREATE INDEX idx_transactions_date ON transactions(date DESC)`;
    await sql`CREATE INDEX idx_budgets_user_id ON budgets(user_id)`;
    await sql`CREATE INDEX idx_goals_user_id ON goals(user_id)`;
    await sql`CREATE INDEX idx_accounts_user_id ON accounts(user_id)`;

    console.log('✅ Database reset complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run db:seed (to add sample data)');
    console.log('   2. Run: npm run dev (to start the app)');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();