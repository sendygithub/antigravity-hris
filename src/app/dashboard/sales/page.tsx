"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Receipt } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteConfirm } from "@/components/ui/delete-confirm"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Types ──────────────────────────────────────────────────────────────────
type Transaction = {
  id: number
  invoiceNo: string
  customerId: number | null
  customer?: { id: number; name: string } | null
  cashier?: { id: number; name: string } | null
  total: number
  paidAmount: number
  status: "PAID" | "PENDING" | "CANCELLED"
  createdAt: string
  items?: { productId: number; quantity: number; price: number }[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

const statusVariant: Record<string, "success" | "warning" | "destructive"> = {
  PAID: "success",
  PENDING: "warning",
  CANCELLED: "destructive",
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function SalesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.set("startDate", startDate)
      if (endDate) params.set("endDate", endDate)
      if (statusFilter !== "ALL") params.set("status", statusFilter)

      const res = await fetch(`/api/transactions?${params}`)
      const json = await res.json()
      if (json.success) setTransactions(json.data?.data ?? json.data ?? [])
    } catch {
      toast.error("Failed to load sales")
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCancel = async (transaction: Transaction) => {
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        toast.success("Transaction cancelled")
        fetchData()
      } else {
        toast.error(json.error || "Failed to cancel transaction")
      }
    } catch {
      toast.error("Failed to cancel transaction")
    }
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  const totalRevenue = transactions
    .filter((t) => t.status === "PAID")
    .reduce((sum, t) => sum + t.total, 0)
  const totalTransactions = transactions.length
  const paidCount = transactions.filter((t) => t.status === "PAID").length
  const cancelledCount = transactions.filter((t) => t.status === "CANCELLED").length

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "invoiceNo",
      header: "Invoice",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-xs font-medium">{row.original.invoiceNo}</span>
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => <span>{row.original.customer?.name ?? "Walk-in"}</span>,
    },
    {
      accessorKey: "cashier",
      header: "Cashier",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.cashier?.name ?? "—"}</span>,
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => <span className="tabular-nums">{row.original.items?.length ?? 0}</span>,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => <span className="font-medium">{formatIDR(row.original.total)}</span>,
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
      cell: ({ row }) => <span>{formatIDR(row.original.paidAmount)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status] ?? "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("id-ID", {
            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const t = row.original
        if (t.status === "CANCELLED") return <span className="text-xs text-muted-foreground">—</span>
        return (
          <DeleteConfirm
            itemName={`invoice ${t.invoiceNo}`}
            onDelete={() => handleCancel(t)}
            trigger={
              <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive">
                Cancel
              </Button>
            }
          />
        )
      },
    },
  ]

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Sales" description="View and manage sales transactions" />

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
            <p className="text-xl font-bold mt-1">{formatIDR(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Transactions</p>
            <p className="text-xl font-bold mt-1">{totalTransactions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Paid</p>
            <p className="text-xl font-bold mt-1 text-emerald-600">{paidCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Cancelled</p>
            <p className="text-xl font-bold mt-1 text-destructive">{cancelledCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="text-xs">Start Date</Label>
          <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 sm:w-44 w-full" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate" className="text-xs">End Date</Label>
          <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 sm:w-44 w-full" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status" className="h-9 w-36">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="h-9" onClick={() => { setStartDate(""); setEndDate(""); setStatusFilter("ALL"); }}>
          Reset
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        emptyTitle="No transactions found"
        emptyDescription="Sales transactions will appear here once customers make purchases."
      />
    </div>
  )
}
