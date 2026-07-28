"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Plus, Edit, Pencil, Search } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader, AddButton } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirm } from "@/components/ui/delete-confirm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Types ──────────────────────────────────────────────────────────────────
type Product = {
  id: number
  name: string
  sku: string
  barcode: string | null
  description: string | null
  price: number
  cost: number
  stock: number
  categoryId: number | null
  category?: { id: number; name: string } | null
  supplierId: number | null
  supplier?: { id: number; name: string } | null
}

type Category = { id: number; name: string }
type Supplier = { id: number; name: string }

type ProductForm = {
  name: string
  sku: string
  barcode: string
  description: string
  price: string
  cost: string
  stock: string
  categoryId: string
  supplierId: string
}

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  barcode: "",
  description: "",
  price: "",
  cost: "",
  stock: "0",
  categoryId: "",
  supplierId: "",
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

// ─── Page ───────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [prodRes, catRes, supRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/suppliers"),
      ])
      const prodJson = await prodRes.json()
      if (prodJson.success) setProducts(prodJson.data?.data ?? prodJson.data ?? [])
      const catJson = await catRes.json()
      if (catJson.success) setCategories(catJson.data?.data ?? catJson.data ?? [])
      const supJson = await supRes.json()
      if (supJson.success) setSuppliers(supJson.data?.data ?? supJson.data ?? [])
    } catch {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingProduct(null)
  }

  const openAdd = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode ?? "",
      description: product.description ?? "",
      price: String(product.price),
      cost: String(product.cost),
      stock: String(product.stock),
      categoryId: product.categoryId ? String(product.categoryId) : "",
      supplierId: product.supplierId ? String(product.supplierId) : "",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.price) {
      toast.error("Name, SKU, and Price are required")
      return
    }
    setSaving(true)
    try {
      const body = {
        name: form.name,
        sku: form.sku,
        barcode: form.barcode || undefined,
        description: form.description || undefined,
        price: Number(form.price),
        cost: Number(form.cost) || 0,
        stock: Number(form.stock) || 0,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        supplierId: form.supplierId ? Number(form.supplierId) : undefined,
      }

      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products"
      const method = editingProduct ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(editingProduct ? "Product updated" : "Product created")
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        toast.error(json.error || "Failed to save product")
      }
    } catch {
      toast.error("Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        toast.success("Product deleted")
        fetchData()
      } else {
        toast.error(json.error || "Failed to delete product")
      }
    } catch {
      toast.error("Failed to delete product")
    }
  }

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnDef<Product>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.barcode && (
            <p className="text-xs text-muted-foreground">Barcode: {row.original.barcode}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{row.original.sku}</code>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <span>{row.original.category?.name ?? "—"}</span>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <span className="font-medium">{formatIDR(row.original.price)}</span>,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.stock
        return stock < 10 ? (
          <Badge variant="warning">{stock}</Badge>
        ) : (
          <span className="tabular-nums">{stock}</span>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <DeleteConfirm
              itemName={product.name}
              onDelete={() => handleDelete(product)}
            />
          </div>
        )
      },
    },
  ]

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={<AddButton label="Add Product" onClick={openAdd} />}
      />

      <DataTable
        columns={columns}
        data={products}
        filterColumn="name"
        filterPlaceholder="Search products..."
        loading={loading}
        emptyTitle="No products found"
        emptyDescription="Get started by adding your first product."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update product details below." : "Fill in the details to add a new product."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. PRD-001" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional product description" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input id="price" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <Input id="cost" type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={form.supplierId} onValueChange={(v) => setForm({ ...form, supplierId: v })}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup.id} value={String(sup.id)}>{sup.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingProduct ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
