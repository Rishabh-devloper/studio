// src/app/settings/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ClerkUserProfile } from "@/components/settings/clerk-user-profile";
import { User, Shield, Database, AlertTriangle, Settings as SettingsIcon, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access settings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8" role="main">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 p-8 shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="gap-1">
                <User className="h-3 w-3" />
                Account Management
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Settings
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your account preferences and security settings
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column - Quick Info */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" aria-hidden="true" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>
                Your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                  <span className="text-sm font-semibold text-right max-w-[200px] truncate">
                    {user?.emailAddresses[0]?.emailAddress || 'Not set'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground">Account ID</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {userId.slice(0, 16)}...
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground">Member Since</span>
                  <span className="text-sm font-semibold">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-background dark:from-green-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" aria-hidden="true" />
                <CardTitle className="text-green-600">Security Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                <Info className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-600">
                  Your account is secured with Clerk authentication. All data is encrypted and protected.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" aria-hidden="true" />
                <CardTitle>Data Management</CardTitle>
              </div>
              <CardDescription>
                Manage your financial data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription className="text-sm">
                  Your financial data is securely stored and only accessible by you. We never share your information.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Database className="mr-2 h-4 w-4" aria-hidden="true" />
                  Export My Data
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    Coming Soon
                  </Badge>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-2 border-red-500/50 bg-gradient-to-br from-red-50 to-background dark:from-red-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  <strong>Warning:</strong> Deleting your account will permanently remove all your data. This action cannot be undone.
                </AlertDescription>
              </Alert>
              <Button variant="destructive" className="w-full" disabled>
                <AlertTriangle className="mr-2 h-4 w-4" aria-hidden="true" />
                Delete My Account
                <span className="ml-auto text-xs">(Contact Support)</span>
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Clerk Profile */}
        <div className="lg:col-span-2">
          <Card className="border-2 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle>Complete Profile Settings</CardTitle>
              <CardDescription>
                Update your profile, security settings, and connected accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="rounded-xl border-2 overflow-hidden bg-background">
                <ClerkUserProfile />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}