"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
// Separator intentionally removed; not used in this component
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  MoreVertical,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

interface SidebarItem {
  title: string
  icon?: React.ElementType
  href: string
  description?: string
}

interface AdminSidebarProps {
  className?: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  items: SidebarItem[]
}

export function AdminSidebar({ className, collapsed = false, onCollapsedChange, items }: AdminSidebarProps) {
  const pathname = usePathname()

  const handleToggle = () => {
    onCollapsedChange?.(!collapsed)
  }

  // Mobile primary items: Overview, User Management, Trades (indexes chosen to match admin config)
  const mobilePrimary = [items[0], items[1], items[3]]
  const mobileMore = items.filter((it) => !mobilePrimary.includes(it))

  return (
    <>
    {/* Enhanced Desktop/Large Sidebar (hidden on small screens) */}
    <div
      className={cn(
        "hidden lg:flex fixed left-0 top-0 h-screen flex-col bg-card/95 backdrop-blur-xl border-r border-border/50 transition-all duration-300 shadow-2xl z-40",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Enhanced Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/50 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-yellow-500/5">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 text-white shadow-lg ring-2 ring-red-500/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                AdminPro
              </h2>
              <p className="text-xs text-muted-foreground font-medium">Control Panel</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="h-8 w-8 p-0 hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 rounded-lg"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Enhanced Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {items.map((item, index) => {
            const isActive = pathname === item.href
            // Ensure icon is defined; fall back to Shield if missing
            const Icon = item.icon || Shield

            return (
              <Link key={index} href={item.href} className="block">
                <div
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-red-500/90 to-orange-500/90 text-white shadow-lg shadow-red-500/25 scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:scale-[1.01] hover:shadow-md",
                    collapsed ? "justify-center px-2" : "justify-start"
                  )}
                  style={{
                    transitionDelay: `${index * 50}ms`
                  }}
                >
                  {/* Active indicator */}
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-full" />
                  )}
                  
                  <div className={cn(
                    "flex items-center transition-all duration-300",
                    collapsed ? "justify-center" : "justify-start"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 transition-all duration-300",
                      collapsed ? "mr-0" : "mr-3",
                      isActive 
                        ? "text-white" 
                        : "text-muted-foreground group-hover:text-red-500 group-hover:scale-110"
                    )} />
                    {!collapsed && (
                      <div className="flex flex-col">
                        <span className="transition-all duration-300 group-hover:translate-x-1">
                          {item.title}
                        </span>
                        {item.description && (
                          <span className="text-xs opacity-70 mt-0.5">
                            {item.description}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Hover effect background */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      {/* Enhanced Footer */}
      <div className="border-t border-border/50 p-4 mt-auto bg-gradient-to-r from-muted/20 to-muted/10">
        {!collapsed ? (
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg">
              <Shield className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Admin Panel</p>
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">v1.0.0 • Secure</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg">
              <Shield className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Enhanced Mobile bottom navigation */}
    <div className="fixed bottom-0 w-full z-[9999] bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-2xl lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <nav className="flex items-center justify-between h-16 px-1">
        {mobilePrimary.map((item, index) => {
          const isActive = pathname === item.href
          const Icon = item.icon || Shield
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 text-xs transition-all duration-300 rounded-lg mx-1 relative group",
                isActive ? "text-red-500" : "text-muted-foreground"
              )}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-red-500 rounded-b-full" />
              )}
              
              <div className={cn(
                "transition-all duration-300 p-1 rounded-lg",
                isActive ? "bg-red-500/10 scale-110" : "group-hover:bg-accent/50 group-hover:scale-105"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive ? "text-red-500" : "group-hover:text-accent-foreground"
                )} />
              </div>
              <span className={cn(
                "mt-1 text-[10px] font-medium transition-all duration-300",
                isActive ? "text-red-500" : "group-hover:text-accent-foreground"
              )}>
                {item.title}
              </span>
            </Link>
          )
        })}

        {/* Enhanced More menu */}
        <div className="flex-1 flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center justify-center py-2 text-xs transition-all duration-300 rounded-lg mx-1 hover:bg-accent/50 group">
                <div className="transition-all duration-300 p-1 rounded-lg group-hover:bg-accent/50 group-hover:scale-105">
                  <MoreVertical className="h-5 w-5" />
                </div>
                <span className="mt-1 text-[10px] font-medium">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48 backdrop-blur-xl bg-card/95 border-border/50">
              {mobileMore.map((it) => {
                const Icon = it.icon || Shield
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