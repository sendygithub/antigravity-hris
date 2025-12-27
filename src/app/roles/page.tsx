"use client"

import * as React from "react"
import { useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Role } from "../../../generated/prisma"
import { TableRole } from "@/components/roles/table-role"
import { CreateRoleDialog } from "@/components/roles/create-role-dialog"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { EditRoleDialog } from "@/components/roles/edit-form"

export const dynamic = "force-dynamic"

export default function RolesPage() {
  // ================= STATE =================
  const [data, setData] = React.useState<Role[]>([])
  const [loadingdata, setLoadingData] = React.useState(true)   
  const [deletingId, setDeletingId] = React.useState(false)       //LOADING FETCH DATA AWAL

  // ================= FETCH DATA =================
  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/role")
      if (!res.ok) throw new Error("Failed to fetch roles")
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  // ================= DELETE ROLE =================
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return

    setDeletingId(true)
    try {
      const res = await fetch(`/api/role/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete role")
         setData(prev => prev.filter(item => Number(item.id) !== id))

    } catch (error) {
      console.error(error)
    } finally {
      setDeletingId(false)
    }
  }

  // ================= COLUMNS (WAJIB DI DALAM COMPONENT) =================
  const columns = React.useMemo<ColumnDef<Role>[]>(() => [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const role = row.original
        return (
          <div className="flex gap-2">
            {/* Edit */}
            <EditRoleDialog role={role} onSuccess={fetchRoles} />

            {/* Delete */}
            <Button
              size="sm"
              variant="destructive"
              disabled={deletingId === true}
              onClick={() => handleDelete(role.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ], [loadingdata])

  if (loadingdata) return <p>Loading Data Roles...</p>                                                      // LOADING DATA ROLES

  // ================= RENDER =================
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Roles & Permissions
        </h1>
        <CreateRoleDialog onSuccess={fetchRoles} />
      </div>

      <div className="p-8">
        <TableRole columns={columns} data={data} />
      </div>
    </div>
  )
}
