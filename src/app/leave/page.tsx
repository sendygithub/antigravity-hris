"use client"
import { RequestLeaveDialog } from "@/components/leave/request-leave-dialog";
import { Tableleave } from "@/components/leave/data-table";
import { useEffect } from "react";
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table"
import { LeaveRequest } from "../../../generated/prisma";
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from "lucide-react"
export const dynamic = 'force-dynamic';
const dataleave : ColumnDef<LeaveRequest>[]  = [
    {
        accessorKey: "id",  
        header: "ID",
    },
    {
        accessorKey: "employeeId",
        header: "Employee ID",
    },      
    {
        accessorKey: "type",
        header: "Leave Type",       
    },
    {
        accessorKey: "startDate",
        header: "Start Date",       
    },
    {
        accessorKey: "endDate",
        header: "End Date",       
    },
    {
        accessorKey: "status",
        header: "Status",       
    },  
    {
        accessorKey: "reason",
        header: "Reason",       
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
export default function LeavePage() {
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const fetchLeave = async () => {
         setLoading(true) 
        try {
            const res = await fetch("/api/leave");
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
        fetchLeave();
    }, []);

    if (loading) return <p>Loading Data...</p>





    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
                <RequestLeaveDialog onSuccess={() => fetchLeave()} />
            </div>

            <div className="w-full">
               <Tableleave columns={dataleave} data={data} />
            </div>
        </div>
    );
}
