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
type Supplier = {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  _count?: { products: number }
}

const emptyForm = { name: "", email: "", phone: "", address: "" }

// ─── Page ───────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/suppliers")
      const json = await res.json()
      if (json.success) setSuppliers(json.data?.data ?? json.data ?? [])
    } catch {
      toast.error("Failed to load suppliers")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => { setForm(emptyForm); setEditing(null) }
  const openAdd = () => { resetForm(); setDialogOpen(true) }
  const openEdit = (sup: Supplier) => {
    setEditing(sup)
    setForm({ name: sup.name, email: sup.email ?? "", phone: sup.phone ?? "", address: sup.address ?? "" })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) { toast.error("Name is required"); return }
    setSaving(true)
    try {
      const body = {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      }
      const url = editing ? `/api/suppliers/${editing.id}` : "/api/suppliers"
      const method = editing ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(editing ? "Supplier updated" : "Supplier created")
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        toast.error(json.error || "Failed to save supplier")
      }
    } catch {
      toast.error("Failed to save supplier")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (sup: Supplier) => {
    try {
      const res = await fetch(`/api/suppliers/${sup.id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        toast.success("Supplier deleted")
        fetchData()
      } else {
        toast.error(json.error || "Failed to delete supplier")
      }
    } catch {
      toast.error("Failed to delete supplier")
    }
  }

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnDef<Supplier>[] = [
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
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email ?? "—"}</span>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span>{row.original.phone ?? "—"}</span>,
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
        const sup = row.original
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(sup)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <DeleteConfirm itemName={sup.name} onDelete={() => handleDelete(sup)} />
          </div>
        )
      },
    },
  ]

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage your suppliers"
        action={<AddButton label="Add Supplier" onClick={openAdd} />}
      />

      <DataTable
        columns={columns}
        data={suppliers}
        filterColumn="name"
        filterPlaceholder="Search suppliers..."
        loading={loading}
        emptyTitle="No suppliers found"
        emptyDescription="Add your first supplier to get started."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update supplier details below." : "Enter the supplier's information."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Supplier name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62-xxx-xxxx" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Optional address" rows={2} />
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
