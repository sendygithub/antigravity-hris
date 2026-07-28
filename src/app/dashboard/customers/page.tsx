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
type Customer = {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  _count?: { transactions: number }
}

const emptyForm = { name: "", email: "", phone: "", address: "" }

// ─── Page ───────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/customers")
      const json = await res.json()
      if (json.success) setCustomers(json.data?.data ?? json.data ?? [])
    } catch {
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => { setForm(emptyForm); setEditing(null) }
  const openAdd = () => { resetForm(); setDialogOpen(true) }
  const openEdit = (cust: Customer) => {
    setEditing(cust)
    setForm({ name: cust.name, email: cust.email ?? "", phone: cust.phone ?? "", address: cust.address ?? "" })
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
      const url = editing ? `/api/customers/${editing.id}` : "/api/customers"
      const method = editing ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(editing ? "Customer updated" : "Customer created")
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        toast.error(json.error || "Failed to save customer")
      }
    } catch {
      toast.error("Failed to save customer")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cust: Customer) => {
    try {
      const res = await fetch(`/api/customers/${cust.id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        toast.success("Customer deleted")
        fetchData()
      } else {
        toast.error(json.error || "Failed to delete customer")
      }
    } catch {
      toast.error("Failed to delete customer")
    }
  }

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnDef<Customer>[] = [
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
      id: "transactionsCount",
      header: "Transactions",
      cell: ({ row }) => <span className="tabular-nums">{row.original._count?.transactions ?? 0}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const cust = row.original
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cust)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <DeleteConfirm itemName={cust.name} onDelete={() => handleDelete(cust)} />
          </div>
        )
      },
    },
  ]

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customer database"
        action={<AddButton label="Add Customer" onClick={openAdd} />}
      />

      <DataTable
        columns={columns}
        data={customers}
        filterColumn="name"
        filterPlaceholder="Search customers..."
        loading={loading}
        emptyTitle="No customers found"
        emptyDescription="Add your first customer."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Customer" : "Add Customer"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update customer details below." : "Enter the customer's information."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Customer name" />
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
