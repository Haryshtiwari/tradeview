"use client"

import React, { useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  History,
  Wallet,
  Key,
  UserCheck,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  className?: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

const sidebarItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    href: "/",
  },
  {
    title: "Positions",
    icon: TrendingUp,
    href: "/positions",
  },
  {
    title: "History",
    icon: History,
    href: "/history",
  },
  {
    title: "Funds",
    icon: Wallet,
    href: "/funds",
  },
  {
    title: "API Access",
    icon: Key,
    href: "/api-access",
  },
  {
    title: "Introducing Broker",
    icon: UserCheck,
    href: "/introducing-broker",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    title: "Profile",
    icon: User,
    href: "/profile",
  },
]

export function TradingSidebar({ className, collapsed = false, onCollapsedChange }: SidebarProps) {
  const STORAGE_KEY = "sidebar_collapsed"

  // Read persisted value synchronously so initial render can use it and
  // avoid flashing the sidebar open when navigating between pages.
  const [persistedCollapsed, setPersistedCollapsed] = React.useState<boolean | null>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      return raw === null ? null : raw === "true"
    } catch {
      return null
    }
  })

  // Effective collapsed state used for rendering. If we have a persisted
  // value use that; otherwise fall back to the parent-controlled prop.
  const isCollapsed = persistedCollapsed !== null ? persistedCollapsed : collapsed

  const handleToggle = () => {
    const next = !isCollapsed
    try {
      localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // ignore
    }

    setPersistedCollapsed(next)
    onCollapsedChange?.(next)
  }

  // When component mounts, if there's a persisted value, sync it into the
  // parent so other parts of the app reflect the user's preference.
  useEffect(() => {
    if (persistedCollapsed !== null && onCollapsedChange && persistedCollapsed !== collapsed) {
      onCollapsedChange(persistedCollapsed)
    }
    // We only want to run this on mount; deps intentionally exclude
    // onCollapsedChange/collapsed to avoid repeated updates during normal
    // renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pathname = usePathname() || "/"

  // Mobile primary items: Dashboard, Positions, Funds (user requested)
  const mobilePrimary = [sidebarItems[0], sidebarItems[1], sidebarItems[3]]
  const mobileMore = sidebarItems.filter((it) => !mobilePrimary.includes(it))

  return (
    <>
      <div
        className={cn(
          // hide on small screens, show from `sm` and up
          "hidden sm:flex flex-col border-r bg-card/95 backdrop-blur-xl transition-all duration-300 fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 shadow-xl border-border/50",
          collapsed ? "w-16" : "w-64",
          className,
        )}
      >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-lg ring-2 ring-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">TradePro</span>
              <span className="text-xs text-muted-foreground font-medium">Trading Platform</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="h-8 w-8 p-0 hover:bg-accent/50 transition-all duration-200 hover:scale-110 rounded-lg"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation - Enhanced with better styling */}
      <div className="flex-1 px-3 py-6 overflow-hidden">
        <nav className="space-y-2">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group w-full flex items-center h-12 transition-all duration-300 font-medium text-sm whitespace-nowrap rounded-xl relative overflow-hidden",
                  collapsed ? "px-2 justify-center" : "px-4 justify-start",
                  isActive 
                    ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" 
                    : "hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:text-accent-foreground hover:scale-[1.01] hover:shadow-md"
                )}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                {/* Active indicator */}
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-primary-foreground rounded-r-full" />
                )}
                
                <div className={cn(
                  "flex items-center transition-all duration-300",
                  collapsed ? "justify-center" : "justify-start"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-300",
                    collapsed ? "mr-0" : "mr-3",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground group-hover:scale-110"
                  )} />
                  {!collapsed && (
                    <span className="transition-all duration-300 group-hover:translate-x-1">
                      {item.title}
                    </span>
                  )}
                </div>
                
                {/* Hover effect background */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {!collapsed && (
        <div className="p-4 border-t border-border/50 bg-gradient-to-r from-muted/20 to-muted/10 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <p className="font-medium text-green-600 dark:text-green-400">System Online</p>
            </div>
            <p className="font-medium">TradePro v2.1.0</p>
            <p className="opacity-70">© 2025 All rights reserved</p>
          </div>
        </div>
      )}
      </div>

      {/* Enhanced Mobile bottom navigation - visible only on small screens */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-2xl sm:hidden">
        <nav className="flex items-center justify-between h-16 px-1">
          {mobilePrimary.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2 text-xs transition-all duration-300 rounded-lg mx-1 relative group",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
                )}
                
                <div className={cn(
                  "transition-all duration-300 p-1 rounded-lg",
                  isActive ? "bg-primary/10 scale-110" : "group-hover:bg-accent/50 group-hover:scale-105"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "text-primary" : "group-hover:text-accent-foreground"
                  )} />
                </div>
                <span className={cn(
                  "mt-1 text-[10px] font-medium transition-all duration-300",
                  isActive ? "text-primary" : "group-hover:text-accent-foreground"
                )}>
                  {item.title}
                </span>
                
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            )
          })}

          {/* Enhanced Profile / More menu */}
          <div className="flex-1 flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center py-2 text-xs transition-all duration-300 rounded-lg mx-1 hover:bg-accent/50 group">
                  <div className="transition-all duration-300 p-1 rounded-lg group-hover:bg-accent/50 group-hover:scale-105">
                    <Avatar className="h-6 w-6 ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
                      <AvatarImage src="" alt="Menu" />
                      <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                        Me
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="mt-1 text-[10px] font-medium transition-all duration-300 group-hover:text-accent-foreground">More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 backdrop-blur-xl bg-card/95 border-border/50">
                {mobileMore.map((it) => {
                  const Icon = it.icon
                  return (
                    <DropdownMenuItem asChild key={it.href}>
                      <Link href={it.href} className="flex items-center space-x-3 transition-all duration-200 hover:bg-accent/50">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{it.title}</span>
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </>
  )
}
