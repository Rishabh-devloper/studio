// src/components/layout/sidebar.tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { WealthWiseLogo } from "@/components/icons";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CircleDollarSign,
  Target,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard,
    badge: null 
  },
  { 
    href: "/transactions", 
    label: "Transactions", 
    icon: ArrowLeftRight,
    badge: null 
  },
  { 
    href: "/budgets", 
    label: "Budgets", 
    icon: CircleDollarSign,
    badge: null 
  },
  { 
    href: "/goals", 
    label: "Goals", 
    icon: Target,
    badge: null 
  },
  { 
    href: "/reports", 
    label: "Reports", 
    icon: BarChart3,
    badge: "New" 
  },
  { 
    href: "/settings", 
    label: "Settings", 
    icon: Settings,
    badge: null 
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <Sidebar className="border-r bg-gradient-to-b from-background to-muted/20" variant="sidebar" aria-label="Primary">
      
      {/* Header with Logo */}
      <SidebarHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary p-2 shadow-lg">
            <WealthWiseLogo className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">WealthWise</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>Smart Finance</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation Menu */}
      <SidebarContent className="flex-1 px-3 py-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={`
                    group relative mb-1 transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg' 
                      : 'hover:bg-primary/5 hover:translate-x-1'
                    }
                  `}
                >
                  <a
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                  >
                    <div className={`
                      rounded-lg p-1.5 transition-colors
                      ${isActive 
                        ? 'bg-primary-foreground/20' 
                        : 'bg-primary/10 group-hover:bg-primary/20'
                      }
                    `}>
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto text-[10px] px-1.5 py-0"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter className="border-t bg-gradient-to-r from-muted/50 to-muted/30 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-background/50 p-3 shadow-sm backdrop-blur-sm">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            {user?.imageUrl && (
              <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
            )}
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
              {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold">
              {user?.fullName || user?.firstName || "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.emailAddresses?.[0]?.emailAddress || ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg hover:bg-destructive/10 hover:text-destructive"
            onClick={() => signOut()}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          Made with ❤️ in India
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}