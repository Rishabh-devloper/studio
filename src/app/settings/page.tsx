import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth, currentUser } from "@clerk/nextjs/server";
import { UserProfile } from "@clerk/nextjs";
import { Bell, User, Trash2, Shield, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    return (
      <div className="prose dark:prose-invert">
        <h1 className="text-2xl font-semibold">Please sign in</h1>
        <p>
          You must be signed in to view your settings.
          <a href="/" className="ml-2 underline">Go to landing</a>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8" role="main">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold md:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle>Profile Management</CardTitle>
            </div>
            <CardDescription>
              Manage your personal information and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>
                  Your profile is managed securely through Clerk. Click below to update your personal information, email, password, and connected accounts.
                </AlertDescription>
              </Alert>
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email</span>
                    <span className="text-sm text-muted-foreground">
                      {user?.emailAddresses[0]?.emailAddress || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account ID</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {userId.slice(0, 16)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Created</span>
                    <span className="text-sm text-muted-foreground">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clerk User Profile Component */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Profile Settings</CardTitle>
            <CardDescription>
              Update your profile, security settings, and connected accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <UserProfile 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0",
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>
              Manage your financial data and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Your financial data (transactions, budgets, goals) is securely stored and encrypted. Only you have access to your data.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="justify-start" disabled>
                <Database className="mr-2 h-4 w-4" aria-hidden="true" />
                Export My Data
                <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" aria-hidden="true" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Permanently delete your account and all associated data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                <strong>Warning:</strong> Deleting your account will permanently remove all your transactions, budgets, goals, and account data. This action is irreversible.
              </AlertDescription>
            </Alert>
            <Button variant="destructive" className="mt-4" disabled>
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Delete My Account
              <span className="ml-2 text-xs">(Contact Support)</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
