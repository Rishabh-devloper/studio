import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { existsSync } from 'fs';

if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config();
}

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // IMPORTANT: Replace with your actual Clerk user ID
    const userId = 'user_34vCY8nr98fTvm7h178dXztVGEw';

    // Create a default account
    console.log('Creating account...');
    const accounts = await sql`
      INSERT INTO accounts (user_id, name, balance)
      VALUES (${userId}, 'Main Account', 5000)
      RETURNING id, name
    `;
    const accountId = accounts[0].id;

    console.log('✅ Created account:', accounts[0].name);

    // Add sample transactions
    console.log('Adding sample transactions...');
    await sql`
      INSERT INTO transactions (user_id, description, amount, type, category, account_id, account_name, date)
      VALUES 
        (${userId}, 'Monthly Salary', 5000, 'income', 'Salary', ${accountId}, 'Main Account', CURRENT_DATE),
        (${userId}, 'Grocery Shopping', -150.50, 'expense', 'Food', ${accountId}, 'Main Account', CURRENT_DATE - INTERVAL '1 day'),
        (${userId}, 'Electricity Bill', -80.00, 'expense', 'Utilities', ${accountId}, 'Main Account', CURRENT_DATE - INTERVAL '2 days'),
        (${userId}, 'Coffee Shop', -12.50, 'expense', 'Food', ${accountId}, 'Main Account', CURRENT_DATE - INTERVAL '3 days'),
        (${userId}, 'Gas Station', -45.00, 'expense', 'Transportation', ${accountId}, 'Main Account', CURRENT_DATE - INTERVAL '4 days')
    `;

    console.log('✅ Added 5 sample transactions');

    // Add sample budgets
    console.log('Adding sample budgets...');
    await sql`
      INSERT INTO budgets (user_id, category, "limit", spent)
      VALUES 
        (${userId}, 'Food', 500, 163.00),
        (${userId}, 'Transportation', 200, 45.00),
        (${userId}, 'Utilities', 150, 80.00),
        (${userId}, 'Entertainment', 100, 0)
    `;

    console.log('✅ Added 4 sample budgets');

    // Add sample goals
    console.log('Adding sample goals...');
    await sql`
      INSERT INTO goals (user_id, name, target_amount, current_amount, deadline)
      VALUES 
        (${userId}, 'Emergency Fund', 10000, 2500, '2025-12-31'),
        (${userId}, 'New Laptop', 1500, 800, '2025-06-30'),
        (${userId}, 'Vacation', 3000, 500, '2025-08-15')
    `;

    console.log('✅ Added 3 sample goals');

    console.log('\n🎉 Seeding complete!');
    console.log('✨ Your database is ready to use!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();