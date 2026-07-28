"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Package, Plus, ArrowDown, ArrowUp, AlertTriangle } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

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

type Product = { id: number; name: string; sku: string; stock: number }

// ─── Helpers ────────────────────────────────────────────────────────────────
const typeVariant: Record<string, "success" | "destructive" | "warning"> = {
  IN: "success",
  OUT: "destructive",
  ADJUSTMENT: "warning",
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function StockPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Adjustment form
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ productId: "", type: "IN", quantity: "", note: "" })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [movRes, prodRes] = await Promise.all([
        fetch("/api/stock?limit=20"),
        fetch("/api/products"),
      ])
      const movJson = await movRes.json()
      if (movJson.success) setMovements(movJson.data?.data ?? movJson.data ?? [])
      const prodJson = await prodRes.json()
      if (prodJson.success) setProducts(prodJson.data?.data ?? prodJson.data ?? [])
    } catch {
      toast.error("Failed to load stock data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => setForm({ productId: "", type: "IN", quantity: "", note: "" })

  const handleAddStock = async () => {
    if (!form.productId || !form.quantity) {
      toast.error("Product and quantity are required")
      return
    }
    setSaving(true)
    try {
      const body = {
        productId: Number(form.productId),
        type: form.type,
        quantity: Number(form.quantity),
        note: form.note || undefined,
      }
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Stock adjustment recorded")
        setFormOpen(false)
        resetForm()
        fetchData()
      } else {
        toast.error(json.error || "Failed to record adjustment")
      }
    } catch {
      toast.error("Failed to record adjustment")
    } finally {
      setSaving(false)
    }
  }

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
        <span className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString("id-ID", {
            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
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
        title="Stock Management"
        description="Record stock adjustments and view movements"
        action={
          <Button onClick={() => setFormOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Adjust Stock
          </Button>
        }
      />

      {/* Quick Summary */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <ArrowDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total In</p>
              <p className="text-lg font-bold">
                {movements.filter((m) => m.type === "IN").reduce((s, m) => s + m.quantity, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <ArrowUp className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Out</p>
              <p className="text-lg font-bold">
                {movements.filter((m) => m.type === "OUT").reduce((s, m) => s + m.quantity, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Adjustments</p>
              <p className="text-lg font-bold">
                {movements.filter((m) => m.type === "ADJUSTMENT").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Movements */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Stock Movements</h3>
        <DataTable
          columns={columns}
          data={movements}
          loading={loading}
          emptyTitle="No stock movements"
          emptyDescription="Stock adjustments will appear here."
        />
      </div>

      {/* Stock Adjustment Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock Adjustment</DialogTitle>
            <DialogDescription>
              Record an inbound, outbound, or adjustment to product stock.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adj-product">Product *</Label>
              <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                <SelectTrigger id="adj-product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} ({p.sku}) — Stock: {p.stock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adj-type">Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="adj-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">IN — Add Stock</SelectItem>
                  <SelectItem value="OUT">OUT — Remove Stock</SelectItem>
                  <SelectItem value="ADJUSTMENT">ADJUSTMENT — Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adj-qty">Quantity *</Label>
              <Input id="adj-qty" type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adj-note">Note</Label>
              <Textarea id="adj-note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Reason for adjustment" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFormOpen(false); resetForm(); }} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleAddStock} disabled={saving}>
              {saving ? "Recording..." : "Record Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
