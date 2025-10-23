"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { X, ChevronRight, TrendingUp, TrendingDown, Star, Eye, Search, Plus } from "lucide-react"
import { TradeDialog } from "@/components/trade-dialog"
import { useTrading } from "@/contexts/TradingContext"
import { useMarket } from "@/contexts/MarketContext"
import { useToast } from "@/hooks/use-toast"
import "@/styles/watchlist.css"

interface Props {
  isOpen: boolean
  onClose: () => void
  inline?: boolean
}

const DEFAULT_SYMBOLS = ["EURUSD", "USDJPY", "GBPUSD", "XAUUSD", "BTCUSD"]
const WATCHLIST_STORAGE_KEY = "tradeview_watchlist"

interface SymbolSearchResult {
  id: number
  symbol: string
  name: string
  base_currency: string
  quote_currency: string
  category_name: string
}

export default function WishlistPanel({ isOpen, onClose, inline = false }: Props) {
  const { toast } = useToast()
  
  // Initialize symbols from localStorage or use defaults
  const [symbols, setSymbols] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return DEFAULT_SYMBOLS
        }
      }
    }
    return DEFAULT_SYMBOLS
  })
  
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SymbolSearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const { openPosition } = useTrading()
  const { setSelectedSymbol, marketData } = useMarket()

  // Save symbols to localStorage whenever symbols change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(symbols))
    }
  }, [symbols])

  // Search for symbols
  const searchSymbols = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`http://localhost:3001/api/market/symbols/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      setSearchResults(data.symbols || [])
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
      toast({ title: 'Search failed', description: 'Unable to search symbols', variant: 'destructive' })
    } finally {
      setIsSearching(false)
    }
  }

  // Add symbol to watchlist
  const addSymbolToWatchlist = (symbolToAdd: string) => {
    if (!symbols.includes(symbolToAdd)) {
      setSymbols(prev => [...prev, symbolToAdd])
      toast({ title: 'Symbol added', description: `${symbolToAdd} added to watchlist` })
    } else {
      toast({ title: 'Already in watchlist', description: `${symbolToAdd} is already in your watchlist` })
    }
    setSearchQuery("")
    setShowSearchResults(false)
  }

  // Remove symbol from watchlist
  const removeSymbolFromWatchlist = (symbolToRemove: string) => {
    setSymbols(prev => prev.filter(s => s !== symbolToRemove))
    toast({ title: 'Symbol removed', description: `${symbolToRemove} removed from watchlist` })
  }

  // Handle search input change with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        searchSymbols(searchQuery)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  type CreatePositionLike = Record<string, unknown>

  const quickOrder = async (symbol: string, side: 'buy' | 'sell') => {
    try {
      setLoading(prev => ({ ...prev, [symbol]: true }))
      // For quick orders we send a market order with 0.01 lots by default
      const payload: CreatePositionLike = {
        symbolId: symbol,
        side,
        lotSize: 0.01,
        orderType: 'market',
        triggerPrice: null,
        stopLoss: null,
        takeProfit: null,
        comment: `Quick ${side.toUpperCase()} ${symbol}`
      }

      await openPosition(payload)
      toast({ title: `Order placed`, description: `${side.toUpperCase()} ${symbol}` })
    } catch (err) {
      toast({ title: 'Order error', description: String(err), variant: 'destructive' })
    } finally {
      setLoading(prev => ({ ...prev, [symbol]: false }))
    }
  }

  // Inline mode: render as a docked panel (no backdrop/fixed positioning)
  if (inline) {
    // Inline mode - but on small screens we prefer overlay/drawer behavior.
    return (
      <div aria-hidden={!isOpen} className={`h-full ${isOpen ? 'block' : 'hidden'}`} role="region" aria-label="Watchlist panel">
        <div className="relative h-full">
          <Card className="watchlist-glass h-full flex flex-col border-l border-border/50 shadow-2xl">
            {/* Enhanced Header */}
            <div className="px-3 py-2 flex items-center justify-between border-b border-border/30 bg-gradient-to-r from-primary/5 to-blue-500/5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-primary/10">
                  <Eye className="w-3 h-3 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-foreground">Watchlist</h3>
                  <p className="text-xs text-muted-foreground">Market Overview</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  {symbols.length}
                </Badge>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 hover:bg-destructive/10">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="p-2 border-b border-border/20" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  placeholder="Search symbols..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 pr-8 h-7 text-xs bg-background/50 border-border/30 focus:border-primary/50"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setShowSearchResults(false)
                    }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 hover:bg-muted/50"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-card border border-border/30 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => addSymbolToWatchlist(result.symbol)}
                      className="p-2 hover:bg-muted/50 cursor-pointer border-b border-border/10 last:border-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-xs text-foreground">{result.symbol}</div>
                          <div className="text-xs text-muted-foreground truncate">{result.name}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {result.category_name}
                          </Badge>
                          <Plus className="w-3 h-3 text-primary" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No Results */}
              {showSearchResults && searchResults.length === 0 && !isSearching && searchQuery && (
                <div className="absolute z-50 mt-1 w-full bg-card border border-border/30 rounded-lg shadow-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">No symbols found</div>
                </div>
              )}
              
              {/* Loading */}
              {isSearching && (
                <div className="absolute z-50 mt-1 w-full bg-card border border-border/30 rounded-lg shadow-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Searching...</div>
                </div>
              )}
            </div>
            
            {/* Enhanced Symbol List */}
            <div className="flex-1 p-2 space-y-1 overflow-auto">
              {symbols.map((s, index) => {
                const md = marketData.find(m => m.symbol === s)
                const price = md?.currentPrice ?? md?.closePrice ?? 0
                const symbolId = md?.symbolId ?? null
                const bid = md?.bid ?? null
                const ask = md?.ask ?? null
                const spread = ask && bid ? (ask - bid).toFixed(5) : null
                const fmt = (v: number | null | undefined) => (typeof v === 'number' ? v.toFixed(5) : '-')
                const priceChange = md?.change ?? 0
                const isPositive = priceChange >= 0
                
                return (
                  <div 
                    key={s}
                    className="watchlist-item group relative p-2 rounded-lg border border-border/20 hover:border-border/40 transition-all duration-300 hover:shadow-lg cursor-pointer bg-gradient-to-r from-card/40 to-muted/20 hover:from-card/60 hover:to-muted/40 backdrop-blur-sm"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Symbol and Price Info */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2" onClick={() => { setSelectedSymbol(s); onClose(); }}>
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-sm text-foreground">{s}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Bid:</span>
                          <span className="font-mono font-semibold text-emerald-600">{fmt(bid)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Ask:</span>
                          <span className="font-mono font-semibold text-red-600">{fmt(ask)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeSymbolFromWatchlist(s)
                          }}
                          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-opacity duration-200"
                        >
                          <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <TradeDialog symbol={s} symbolId={symbolId ?? 0} price={String(ask ?? price)} type="buy">
                        <Button 
                          size="sm" 
                          className="watchlist-buy-btn flex-1 h-6 text-xs font-semibold text-white shadow-sm"
                          disabled={loading[s]}
                        >
                          Buy
                        </Button>
                      </TradeDialog>

                      <TradeDialog symbol={s} symbolId={symbolId ?? 0} price={String(bid ?? price)} type="sell">
                        <Button 
                          size="sm" 
                          className="watchlist-sell-btn flex-1 h-6 text-xs font-semibold text-white shadow-sm"
                          disabled={loading[s]}
                        >
                          Sell
                        </Button>
                      </TradeDialog>
                    </div>

                    {/* Loading Overlay */}
                    {loading[s] && (
                      <div className="absolute inset-0 bg-card/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <div className="watchlist-spinner h-4 w-4"></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Default (overlay) mode - constrained to parent (chart) by using absolute positioning
  return (
    <div aria-hidden={!isOpen} className={`absolute inset-0 z-[70] ${isOpen ? '' : 'pointer-events-none'}`} role="dialog" aria-modal={isOpen}>
      {/* Enhanced Backdrop */}
      <div className={`absolute inset-0 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />

      <div className={`absolute top-0 right-0 h-full transition-all duration-500 ease-out ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`} style={{ width: '28%' }}>
        <Card className="h-full flex flex-col bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-xl border-l border-border/50 shadow-2xl">
          {/* Enhanced Header */}
          <div className="p-4 flex items-center justify-between border-b border-border/30 bg-gradient-to-r from-primary/5 to-blue-500/5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Watchlist</h3>
                <p className="text-sm text-muted-foreground">Market Overview</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {symbols.length} pairs
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 hover:bg-destructive/10">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Enhanced Symbol List */}
          <div className="flex-1 p-4 space-y-2 overflow-auto">
            {symbols.map((s, index) => {
              const md = marketData.find(m => m.symbol === s)
              const bid = md?.bid ?? null
              const ask = md?.ask ?? null
              const spread = ask && bid ? (ask - bid).toFixed(5) : null
              const fmt = (v: number | null | undefined) => (typeof v === 'number' ? v.toFixed(5) : '-')
              const priceChange = md?.change ?? 0
              const isPositive = priceChange >= 0
              
              return (
                <div 
                  key={s} 
                  className="watchlist-item group relative p-4 rounded-xl border border-border/20 hover:border-border/40 transition-all duration-300 hover:shadow-lg cursor-pointer"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  {/* Symbol Header */}
                  <div className="flex items-center justify-between mb-3" onClick={() => { setSelectedSymbol(s); onClose(); }}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-base text-foreground">{s}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <Badge 
                          variant={isPositive ? "default" : "destructive"} 
                          className={`text-sm px-2 py-1 ${isPositive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}
                        >
                          {isPositive ? '+' : ''}{priceChange.toFixed(4)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Price Information */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span className="text-muted-foreground">Bid:</span>
                          <span className="font-mono font-bold text-emerald-600">{fmt(bid)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-muted-foreground">Ask:</span>
                          <span className="font-mono font-bold text-red-600">{fmt(ask)}</span>
                        </div>
                      </div>
                      {spread && (
                        <div className="text-sm text-muted-foreground">
                          Spread: <span className="font-mono font-semibold">{spread}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      size="sm" 
                      className="watchlist-buy-btn flex-1 h-8 text-sm font-semibold text-white shadow-lg" 
                      onClick={() => quickOrder(s, 'buy')} 
                      disabled={!!loading[s]}
                    >
                      Buy
                    </Button>
                    <Button 
                      size="sm" 
                      className="watchlist-sell-btn flex-1 h-8 text-sm font-semibold text-white shadow-lg" 
                      onClick={() => quickOrder(s, 'sell')} 
                      disabled={!!loading[s]}
                    >
                      Sell
                    </Button>
                  </div>

                  {/* Loading Overlay */}
                  {loading[s] && (
                    <div className="absolute inset-0 bg-card/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <div className="watchlist-spinner h-6 w-6"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
