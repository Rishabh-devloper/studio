'use server';

/**
 * @fileOverview This file defines a Genkit flow for categorizing transactions using AI.
 *
 * categorizeTransactions - A function that takes a transaction description and returns a category.
 * CategorizeTransactionsInput - The input type for the categorizeTransactions function.
 * CategorizeTransactionsOutput - The return type for the categorizeTransactions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTransactionsInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction to categorize.'),
  transactionAmount: z.number().describe('The amount of the transaction.'),
});
export type CategorizeTransactionsInput = z.infer<
  typeof CategorizeTransactionsInputSchema
>;

const CategorizeTransactionsOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'The category that the transaction falls into (e.g., Food, Transportation, Entertainment).' + 
      'Must be one of the following: Food, Transportation, Entertainment, Utilities, Rent, Salary, Shopping, Travel, Other'
    ),
});
export type CategorizeTransactionsOutput = z.infer<
  typeof CategorizeTransactionsOutputSchema
>;

export async function categorizeTransactions(
  input: CategorizeTransactionsInput
): Promise<CategorizeTransactionsOutput> {
  return categorizeTransactionsFlow(input);
}

const categorizeTransactionsPrompt = ai.definePrompt({
  name: 'categorizeTransactionsPrompt',
  input: {schema: CategorizeTransactionsInputSchema},
  output: {schema: CategorizeTransactionsOutputSchema},
  prompt: `You are an AI assistant that categorizes transactions based on their description and amount.

  The transaction description is: {{{transactionDescription}}}
  The transaction amount is: {{{transactionAmount}}}

  Categorize this transaction into one of the following categories: Food, Transportation, Entertainment, Utilities, Rent, Salary, Shopping, Travel, Other.
  Return only the category.`,
});

const categorizeTransactionsFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionsFlow',
    inputSchema: CategorizeTransactionsInputSchema,
    outputSchema: CategorizeTransactionsOutputSchema,
  },
  async input => {
    const {output} = await categorizeTransactionsPrompt(input);
    return output!;
  }
);
