
"use server";

import { categorizeTransactions } from "@/ai/flows/categorize-transactions";
import { z } from "zod";

const FormSchema = z.object({
  description: z.string(),
  amount: z.number(),
});

export async function getCategorySuggestion(
  description: string,
  amount: number
) {
  try {
    const validation = FormSchema.safeParse({ description, amount });
    if (!validation.success) {
      return {
        error: "Invalid input.",
      };
    }

    const result = await categorizeTransactions({
      transactionDescription: validation.data.description,
      transactionAmount: validation.data.amount,
    });

    return { category: result.category };
  } catch (e) {
    console.error(e);
    return {
      error: "Failed to get suggestion. Please try again.",
    };
  }
}
