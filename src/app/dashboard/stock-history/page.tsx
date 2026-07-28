"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"

// ─── Types ──────────────────────────────────────────────────────────────────
type StockMovement = {
  id: number
  productId: number
  product?: { id: number; name: string; sku: string }
  type: "IN" | "OUT" | "ADJUSTMENT"
  quantity: number
  note: string | null
  createdAt: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const typeVariant: Record<string, "success" | "destructive" | "warning"> = {
  IN: "success",
  OUT: "destructive",
  ADJUSTMENT: "warning",
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function StockHistoryPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/stock?limit=100")
      const json = await res.json()
      if (json.success) setMovements(json.data?.data ?? json.data ?? [])
    } catch {
      toast.error("Failed to load stock history")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnDef<StockMovement>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span>
          {new Date(row.original.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.product?.name ?? "Unknown"}</p>
          {row.original.product?.sku && (
            <p className="text-xs text-muted-foreground font-mono">{row.original.product.sku}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={typeVariant[row.original.type] ?? "secondary"}>
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => {
        const qty = row.original.quantity
        const isOut = row.original.type === "OUT"
        return (
          <span className={`tabular-nums font-medium ${isOut ? "text-destructive" : "text-emerald-600"}`}>
            {isOut ? `-${qty}` : `+${qty}`}
          </span>
        )
      },
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.note ?? "—"}</span>,
    },
  ]

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Stock History"
        description="Complete log of all stock movements"
      />

      <DataTable
        columns={columns}
        data={movements}
        loading={loading}
        emptyTitle="No stock movements"
        emptyDescription="Stock history will appear once adjustments are recorded."
      />
    </div>
  )
}
