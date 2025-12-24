"use client";


import { AddDepartmentDialog } from "@/components/departments/add-department-dialog";
import { TableDepartment } from "@/components/departments/table-departmen";
import { ColumnDef } from "@tanstack/react-table"
import {  useEffect } from "react";
import * as React from "react";
import { Employee } from "../../../generated/prisma";
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from "lucide-react"
export const dynamic = 'force-dynamic';
const datadepartments : ColumnDef<Employee>[] = [
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


export default function DepartmentsPage() {

    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);


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
