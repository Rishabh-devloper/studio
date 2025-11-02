// src/components/transactions/export-transactions-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllTransactions } from '@/app/actions';
import Papa from 'papaparse';

export function ExportTransactionsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const transactions = await getAllTransactions();
      
      if (transactions.length === 0) {
        toast({
          title: 'No Transactions',
          description: 'There are no transactions to export.',
          variant: 'default',
        });
        setIsLoading(false);
        return;
      }

      // Transform data for CSV export
      const csvData = transactions.map(t => ({
        date: formatDate(t.date), // 🔥 FIX: Use helper function
        description: t.description,
        amount: parseFloat(t.amount), // Convert string to number
        type: t.type,
        category: t.category,
        accountName: t.accountName || 'N/A',
      }));

      const csv = Papa.unparse({
        fields: ['date', 'description', 'amount', 'type', 'category', 'accountName'],
        data: csvData,
      });

      // Create and download CSV file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful ✅',
        description: `${transactions.length} transactions exported to CSV.`,
      });

    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast({
        title: 'Export Failed',
        description: 'An unexpected error occurred while exporting your transactions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-9 gap-2"
      onClick={handleExport}
      disabled={isLoading}
      aria-label="Export transactions to CSV"
    >
      <File className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{isLoading ? 'Exporting...' : 'Export'}</span>
    </Button>
  );
}

// 🔥 Helper function to safely format dates
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    // If it's already a string in YYYY-MM-DD format, return as is
    if (typeof date === 'string') {
      const parsed = new Date(date);
      // Check if valid date
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
      return date; // Return original string if can't parse
    }
    
    // If it's a Date object
    if (date instanceof Date) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}