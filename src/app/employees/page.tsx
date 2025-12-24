"use client"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/employees/data-table"
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog"
import { useEffect, useState } from "react";
import * as React from "react";
import { Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
export const dynamic = 'force-dynamic';
// Tipe data employee
type Employee = {
  id: number
  name: string
  email: string
  role: string
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
  },
  
  {
    accessorKey: "hiredDate",
    header: "Hire Date",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const task = row.original

            return (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {  }}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => { }}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },

]
export default function EmployeesPage() {

  const [data, setData] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)


 
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
