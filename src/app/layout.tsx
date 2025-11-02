import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from '@clerk/nextjs';
import { ConditionalLayout } from '@/components/layout/conditional-layout';

export const metadata: Metadata = {
  title: 'WealthWise',
  description: 'Personal finance dashboard to track income, expenses, and financial goals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body className={cn("font-body antialiased", "bg-background text-foreground")}>
          <ConditionalLayout>{children}</ConditionalLayout>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
