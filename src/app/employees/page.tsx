"use client"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/employees/data-table"
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog"
import { useEffect, useState } from "react";
import * as React from "react";
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditEmployeeDialog } from "@/components/employees/edit-form";
import { Employee } from "../../../generated/prisma";
import { de } from "date-fns/locale";
export const dynamic = 'force-dynamic';


// =================konversi iso date ke indonesia  =================
export function formatTanggalID(date: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}











export default function EmployeesPage() {
// ================= STATE =================
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = useState(true)
  const [deletingId, setdeletingId] = React.useState(false);


 // ================= FETCH DATA =================
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees")
        if (!res.ok) throw new Error("Failed to fetch")
        const result = await res.json()
        setData(result)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  useEffect(() => {
    fetchEmployees()
  }, [])

//DELETE EMPLOYEE
const handleDelete = async (id: number) => {
  if (!confirm("Yakin ingin menghapus data ini?")) return

  try {
    const res = await fetch(`/api/employees/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete employee")
       setData(prev => prev.filter(item => Number(item.id) !== id))

  } catch (error) {
    console.error(error)
  } finally {
    setdeletingId(false)
  }
}


  


// Definisi kolom tabel
const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "Name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "roleId",
    header: "Role",
  },
  {
    accessorKey: "departmentId",
    header: "Department ID",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "joinedDate",
    header: "Joined Date",
    cell: ({ row }) =>
    formatTanggalID(row.getValue("joinedDate")),
  },
  
  {
    accessorKey: "hiredDate",
    header: "Hire Date",
    cell: ({ row }) =>
    formatTanggalID(row.getValue("hiredDate")),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) =>
    formatTanggalID(row.getValue("createdAt")),
  },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const employees = row.original





            return (
                <div className="flex gap-2">
                        <EditEmployeeDialog employee={employees} onSuccess={fetchEmployees} />
                  

                    <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletingId === true}
                        onClick={() => { handleDelete(employees.id) }}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },

]
if (loading) return <p>Loading Data...</p>
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                <AddEmployeeDialog onSuccess={fetchEmployees} />
            </div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}
