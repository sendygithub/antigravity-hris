"use client";
import * as React from "react";
import { TableRole } from "@/components/roles/table-role";
import { CreateRoleDialog } from "@/components/roles/create-role-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect } from "react";
import { Role } from "../../../generated/prisma";
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from "lucide-react"

export const dynamic = 'force-dynamic';
// Tipe data role


const dataroles: ColumnDef<Role>[] = [
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
            const task = row.original

          function fetchroles() {
            throw new Error("Function not implemented.");
          }

            return (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={async() => {
                          
                        }}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        
                        onClick={async() => {
                          const res = await fetch(`/api/role/${task.id}`, { method: "DELETE" });

                          if (res.ok) {
                            fetchroles();
                          }
                        }}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
export default function RolesPage() {

      const [data, setData] = React.useState([]);
        const [loading, setLoading] = React.useState(true);
    
    const fetchroles = async () => {
          try {
            const res = await fetch("/api/role");
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
                fetchroles()
              }, [])
            
              if (loading) return <p>Loading Data Roles...</p>
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                <CreateRoleDialog />
            </div>

            <div className="p-8">
                <TableRole columns={dataroles} data={data} />
            </div>
        </div>
    );
}