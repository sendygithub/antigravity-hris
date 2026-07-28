"use client"

import { useEffect, useState, useCallback } from "react"
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"

// ─── Types ──────────────────────────────────────────────────────────────────
type DashboardData = {
  stats: {
    totalProducts: number
    totalCategories: number
    totalSuppliers: number
    totalCustomers: number
    todaySales: number
    todayTransactions: number
    lowStockProducts: number
    monthlyRevenue: number
  }
  salesChart: { date: string; total: number; count: number }[]
  topProducts: { id: number; name: string; totalSold: number; revenue: number }[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const STAT_COLORS = [
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", icon: "text-indigo-600 dark:text-indigo-400" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-amber-100 dark:bg-amber-900/30", icon: "text-amber-600 dark:text-amber-400" },
  { bg: "bg-purple-100 dark:bg-purple-900/30", icon: "text-purple-600 dark:text-purple-400" },
]

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

// ─── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-7 w-16 rounded bg-muted" />
        </div>
        <div className="h-10 w-10 rounded-full bg-muted" />
      </div>
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="rounded-xl border bg-card p-6 animate-pulse">
      <div className="h-4 w-36 rounded bg-muted mb-6" />
      <div className="h-[280px] rounded bg-muted/50" />
    </div>
  )
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  colorIndex,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  colorIndex: number
}) {
  const c = STAT_COLORS[colorIndex % STAT_COLORS.length]
  return (
    <div className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/dashboard?days=30&topProducts=5")
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch {
      toast.error("Gagal memuat data dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const stats = data?.stats
  const salesChart = data?.salesChart ?? []
  const topProducts = data?.topProducts ?? []

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your business at a glance</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard title="Today Sales" value={formatIDR(stats?.todaySales ?? 0)} icon={TrendingUp} colorIndex={0} />
          <StatCard title="Today Transactions" value={stats?.todayTransactions ?? 0} icon={ShoppingCart} colorIndex={1} />
          <StatCard title="Total Products" value={stats?.totalProducts ?? 0} icon={Package} colorIndex={2} />
          <StatCard title="Low Stock Items" value={stats?.lowStockProducts ?? 0} icon={AlertTriangle} colorIndex={3} />
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChart.length > 0 ? salesChart : [{ date: "No data", total: 0, count: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(v: string) => {
                        const d = new Date(v + "T00:00:00")
                        return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : `${v}`)}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                      }}
                      formatter={(value: number) => [formatIDR(value), "Revenue"]}
                      labelFormatter={(label: string) => {
                        const d = new Date(label + "T00:00:00")
                        return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                      }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="hsl(239, 84%, 67%)" maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts.length > 0 ? topProducts : [{ name: "No data", totalSold: 0, revenue: 0, id: 0 }]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                      }}
                      formatter={(value: number) => [value + " sold", "Quantity"]}
                    />
                    <Bar dataKey="totalSold" radius={[0, 6, 6, 0]} fill="hsl(38, 92%, 50%)" maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary */}
      {!loading && stats && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Categories</p>
            <p className="text-xl font-bold">{stats.totalCategories}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Suppliers</p>
            <p className="text-xl font-bold">{stats.totalSuppliers}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Customers</p>
            <p className="text-xl font-bold">{stats.totalCustomers}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Monthly Revenue</p>
            <p className="text-xl font-bold">{formatIDR(stats.monthlyRevenue)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
