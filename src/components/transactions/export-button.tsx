// src/components/transactions/export-button.tsx
// (If this file exists, replace it with this code)

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

      // Transform data for CSV export with safe date handling
      const csvData = transactions.map(t => {
        // Safe date conversion
        let formattedDate = 'N/A';
        if (t.date) {
          try {
            const dateObj = typeof t.date === 'string' ? new Date(t.date) : t.date;
            if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toLocaleDateString('en-US');
            }
          } catch (e) {
            console.warn('Date formatting error:', e);
          }
        }

        return {
          date: formattedDate,
          description: t.description,
          amount: parseFloat(t.amount),
          type: t.type,
          category: t.category,
          accountName: t.accountName || 'N/A',
        };
      });

      const csv = Papa.unparse({
        fields: ['date', 'description', 'amount', 'type', 'category', 'accountName'],
        data: csvData,
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful ✅',
        description: `${transactions.length} transactions exported successfully.`,
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