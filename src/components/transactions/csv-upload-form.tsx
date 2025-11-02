// src/components/transactions/csv-upload-form.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CsvUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success! 🎉',
          description: `${data.count || 'All'} transactions imported successfully.`,
        });
        
        // Reset form
        setFile(null);
        const fileInput = event.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // 🔥 FORCE REFRESH: Navigate to dashboard and refresh
        router.push('/dashboard');
        router.refresh();
        
      } else {
        toast({
          title: 'Import Failed',
          description: data.error || 'An error occurred while importing the CSV file.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading CSV file:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to connect to the server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input 
        type="file" 
        accept=".csv" 
        onChange={handleFileChange}
        disabled={isUploading}
        className="max-w-xs"
      />
      <Button 
        type="submit" 
        size="sm" 
        disabled={!file || isUploading}
        className="gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Import CSV
          </>
        )}
      </Button>
    </form>
  );
}