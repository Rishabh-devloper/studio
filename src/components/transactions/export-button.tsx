'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
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
        return;
      }

      const csv = Papa.unparse({
        fields: ['date', 'description', 'amount', 'type', 'category', 'accountName'],
        data: transactions.map(t => ({
          ...t,
          date: t.date.toLocaleDateString(), // Format date for readability
        })),
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'transactions.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: 'Your transactions have been exported to transactions.csv.',
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
      aria-label="Export transactions"
    >
      <File className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{isLoading ? 'Exporting...' : 'Export'}</span>
    </Button>
  );
}
