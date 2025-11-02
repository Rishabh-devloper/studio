import { NextRequest, NextResponse } from 'next/server';
import { addTransactions } from '@/app/actions';
import { z } from 'zod';
import Papa from 'papaparse';

const transactionSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(['income', 'expense']),
  category: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const fileContent = await file.text();

  try {
    const { data } = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    const transactions = z.array(transactionSchema).parse(data);

    await addTransactions(transactions);

    return NextResponse.json({ message: 'Transactions imported successfully' });
  } catch (error) {
    console.error('Error parsing or adding transactions:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An error occurred during CSV import' }, { status: 500 });
  }
}
