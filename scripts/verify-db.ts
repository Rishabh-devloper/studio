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

async function verifyDatabase() {
  console.log('🔍 Verifying database tables...\n');

  try {
    // Check all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('📋 Tables found:');
    tables.forEach((t: any) => console.log(`  - ${t.table_name}`));
    console.log('');

    // Check transactions table structure
    const transactionsColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'transactions'
      ORDER BY ordinal_position
    `;

    if (transactionsColumns.length > 0) {
      console.log('✅ Transactions table columns:');
      transactionsColumns.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('❌ Transactions table not found!');
    }

    console.log('\n✅ Database verification complete!');
  } catch (error) {
    console.error('❌ Error verifying database:', error);
    process.exit(1);
  }
}

verifyDatabase();
