"use client";


import { AddDepartmentDialog } from "@/components/departments/add-department-dialog";
import { TableDepartment } from "@/components/departments/table-departmen";
import { ColumnDef } from "@tanstack/react-table"
import {  useEffect } from "react";
import * as React from "react";
import { Department } from "../../../generated/prisma";
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import EditDepartmentDialog from "@/components/departments/edit-department";

export const dynamic = 'force-dynamic';




export default function DepartmentsPage() {
 // ================= STATE =================
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [deletingId, setdeletingId] = React.useState(false);

 // ================= FETCH DATA =================
    const fetchDepartments = async () => {
          try {
            const res = await fetch("/api/departments");
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
        fetchDepartments()
      }, [])

  // ================= DELETE DEPARTMENT =================
      const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus data ini?")) return

        try {
          const res = await fetch(`/api/departments/${id}`, {
            method: "DELETE",
          })
          if (!res.ok) throw new Error("Failed to delete department")
             setData(prev => prev.filter(item => Number(item.id) !== id))

        } catch (error) {
          console.error(error)
        } finally {
          setdeletingId(false)
        }
      }

const datadepartments : ColumnDef<Department>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const department = row.original
          
            return (
                <div className="flex gap-2">
                    <EditDepartmentDialog department={department} onSuccess={fetchDepartments} />

                    <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletingId === true}
                        onClick={() =>handleDelete(department.id) }
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]







  // ================= RENDER =================
    
      if (loading) return <p>Loading Data Department...</p>

    return (
        <div className="p-1">
        <div className=" flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <AddDepartmentDialog onSuccess= {fetchDepartments} />
        </div>
         <div className="p-8">
                <TableDepartment columns={datadepartments} data={data} />
                </div>
        </div>
    );
}
