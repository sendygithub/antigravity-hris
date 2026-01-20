"use client"
import { RequestLeaveDialog } from "@/components/leave/request-leave-dialog";
import { Tableleave } from "@/components/leave/data-table";
import { useEffect } from "react";
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table"
import { LeaveRequest } from "../../../generated/prisma";
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from "lucide-react"
import EditLeaveDialog from "@/components/leave/edit-form";
export const dynamic = 'force-dynamic';

// =================konversi iso date ke indonesia  =================
export function formatTanggalID(date: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function LeavePage() {
     // ================= STATE =================
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [deletingId, setdeletingId] = React.useState(false);
// ================= FETCH DATA =================
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

//DELETE LEAVE REQUEST
const handleDelete = async (id: number) => {
  if (!confirm("Yakin ingin menghapus data ini?")) return

  try {
    const res = await fetch(`/api/leave/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete leave request")
       setData(prev => prev.filter(item => Number(item.id) !== id))

  } catch (error) {
    console.error(error)
  } finally {
    setdeletingId(false)
  }
}

// Definisi kolom tabel
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
        cell: ({ row }) => {
            return formatTanggalID(row.getValue("startDate"));
        }       
    },
    {
        accessorKey: "endDate",
        header: "End Date",       
        cell: ({ row }) => {
            return formatTanggalID(row.getValue("endDate"));
        }
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
            const leave = row.original

            return (
                <div className="flex gap-2">
                    <EditLeaveDialog leave={leave} onSuccess={fetchLeave}/>
                    <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletingId === true}
                        onClick={() => { handleDelete(leave.id) }}
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
                <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
                <RequestLeaveDialog onSuccess={() => fetchLeave()} />
            </div>

            <div className="w-full">
               <Tableleave columns={dataleave} data={data} />
            </div>
        </div>
    );
}
