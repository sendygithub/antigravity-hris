"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  Package,
  FolderTree,
  Truck,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartSkeleton, StatCardSkeleton } from "@/components/ui/skeleton"

// ─── Types ──────────────────────────────────────────────────────────────────
type DashboardData = {
  stats: {
    totalProducts: number
    totalCategories: number
    totalSuppliers: number
    totalCustomers: number
  }
  lowStockProducts: { id: number; name: string; sku: string; stock: number }[]
  monthlyRevenue: { month: string; total: number }[]
  topProducts: { id: number; name: string; totalSold: number }[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

const STAT_COLORS = [
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", icon: "text-indigo-600 dark:text-indigo-400" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-amber-100 dark:bg-amber-900/30", icon: "text-amber-600 dark:text-amber-400" },
  { bg: "bg-purple-100 dark:bg-purple-900/30", icon: "text-purple-600 dark:text-purple-400" },
]

function StatCard({ title, value, icon: Icon, colorIndex }: {
  title: string; value: string | number; icon: React.ElementType; colorIndex: number
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
export default function ReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/dashboard")
      const json = await res.json()
      if (json.success) setData(json.data as unknown as DashboardData)
      else toast.error("Failed to load report data")
    } catch {
      toast.error("Failed to load report data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Reports" description="Business insights and analytics" />

      {/* Stat Cards */}
      {loading ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Products" value={data?.stats.totalProducts ?? 0} icon={Package} colorIndex={0} />
          <StatCard title="Categories" value={data?.stats.totalCategories ?? 0} icon={FolderTree} colorIndex={1} />
          <StatCard title="Suppliers" value={data?.stats.totalSuppliers ?? 0} icon={Truck} colorIndex={2} />
          <StatCard title="Customers" value={data?.stats.totalCustomers ?? 0} icon={Users} colorIndex={3} />
        </div>
      )}

      {/* Low Stock Alert */}
      {!loading && data?.lowStockProducts && data.lowStockProducts.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-base">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div>
                    <span className="font-medium text-sm">{p.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 font-mono">{p.sku}</span>
                  </div>
                  <Badge variant="warning">{p.stock} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Monthly Revenue */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Monthly Revenue
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthlyRevenue?.length ? data.monthlyRevenue : [{ month: "No data", total: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : `${v}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(value: number) => [formatIDR(value), "Revenue"]}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="hsl(142, 76%, 36%)" maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-indigo-500" />
              Top Selling Products
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.topProducts?.length ? data.topProducts.slice(0, 10) : [{ name: "No data", totalSold: 0 }]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={140} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(value: number) => [value, "Sold"]}
                  />
                  <Bar dataKey="totalSold" radius={[0, 6, 6, 0]} fill="hsl(239, 84%, 67%)" maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
