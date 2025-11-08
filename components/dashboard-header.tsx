"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, HelpCircle, Settings, LogOut } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  userName?: string
  userInitials?: string
}

export function DashboardHeader({ userName = "John Doe", userInitials = "JD" }: DashboardHeaderProps) {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Notifications and Help */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" title="Notifications">
          <Bell className="w-4 h-4" />
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-destructive text-destructive-foreground">
            2
          </span>
        </Button>
        <Button variant="ghost" size="sm" title="Help">
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Navigation */}
      <div className="text-sm text-muted-foreground">
        {pathname === "/dashboard" && "Dashboard"}
        {pathname === "/family" && "Family Members"}
        {pathname === "/expenses" && "Expense Tracker"}
        {pathname === "/settings" && "Settings"}
      </div>

      {/* Settings Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="w-4 h-4 mr-2" />
              Account Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
