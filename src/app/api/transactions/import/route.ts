// src/app/api/transactions/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { addTransactions } from '@/app/actions';
import { z } from 'zod';
import Papa from 'papaparse';
import { revalidatePath } from 'next/cache';

const transactionSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(['income', 'expense']),
  category: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileContent = await file.text();

    const { data } = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    // Validate and transform data
    const transactions = z.array(transactionSchema).parse(data);

    // Add transactions to database
    const result = await addTransactions(transactions);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // 🔥 CRITICAL FIX: Revalidate all affected pages
    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    revalidatePath('/reports');
    revalidatePath('/budgets');

    return NextResponse.json({ 
      message: 'Transactions imported successfully',
      count: transactions.length 
    });

  } catch (error) {
    console.error('Error parsing or adding transactions:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid CSV format. Expected columns: date, description, amount, type, category' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'An error occurred during CSV import' 
    }, { status: 500 });
  }
}