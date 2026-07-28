"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader, AddButton } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DeleteConfirm } from "@/components/ui/delete-confirm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

// ─── Types ──────────────────────────────────────────────────────────────────
type Category = {
  id: number
  name: string
  description: string | null
  _count?: { products: number }
}

const emptyForm = { name: "", description: "" }

// ─── Page ───────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/categories")
      const json = await res.json()
      if (json.success) setCategories(json.data?.data ?? json.data ?? [])
    } catch {
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => { setForm(emptyForm); setEditing(null) }
  const openAdd = () => { resetForm(); setDialogOpen(true) }
  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description ?? "" })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) { toast.error("Name is required"); return }
    setSaving(true)
    try {
      const body = { name: form.name, description: form.description || undefined }
      const url = editing ? `/api/categories/${editing.id}` : "/api/categories"
      const method = editing ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(editing ? "Category updated" : "Category created")
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        toast.error(json.error || "Failed to save category")
      }
    } catch {
      toast.error("Failed to save category")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        toast.success("Category deleted")
        fetchData()
      } else {
        toast.error(json.error || "Failed to delete category")
      }
    } catch {
      toast.error("Failed to delete category")
    }
  }

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnDef<Category>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.description ?? "—"}</span>,
    },
    {
      id: "productsCount",
      header: "Products",
      cell: ({ row }) => <span className="tabular-nums">{row.original._count?.products ?? 0}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const cat = row.original
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <DeleteConfirm itemName={cat.name} onDelete={() => handleDelete(cat)} />
          </div>
        )
      },
    },
  ]

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Categories"
        description="Organize products by category"
        action={<AddButton label="Add Category" onClick={openAdd} />}
      />

      <DataTable
        columns={columns}
        data={categories}
        filterColumn="name"
        filterPlaceholder="Search categories..."
        loading={loading}
        emptyTitle="No categories found"
        emptyDescription="Create your first category to organize products."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the category details." : "Enter the details for the new category."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
